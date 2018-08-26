import { inject, injectable } from 'inversify'
import * as Stripe from 'stripe'

import { Copy } from '@mte/common/constants/copy'
import { Types } from '@mte/common/constants/inversify'
import { Price } from '@mte/common/api/entities/price'
import { Product } from '@mte/common/api/entities/product'
import { ProductService } from '../product.service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

/**
 * Stripe service
 *
 * @export
 * @class StripeProductService
 * @description Methods for interacting with the Stripe Products API
 */
@injectable()
export class StripeProductService {

    constructor(
        @inject(Types.ProductService) private productService: ProductService,
    ) { }

    public async createProducts(products: Product[]): Promise<Stripe.products.IProduct[]> {
        if (products.some((product) => product.isVariation)) {
            throw new Error('Attempted to create Stripe products from product variations.')
        }
        if (!products || !products.length || products.every((product) => product.isEnteredIntoStripe)) {
            return []
        }
        if (products.some((product) => product.stockQuantity === 0)) {
            throw new Error(Copy.ErrorMessages.itemOutOfStockError)
        }
        const stripeCreateProductPromises: Promise<Stripe.products.IProduct>[] = []
        let stripeProducts: Stripe.products.IProduct[]
        for (const dbProduct of products) {
            if (dbProduct.isEnteredIntoStripe) {
                continue
            }
            try {
                stripeCreateProductPromises.push(stripe.products.create(
                    this._getProductCreationOptionsFromProduct(dbProduct)
                ))
                stripeProducts = await Promise.all(stripeCreateProductPromises)
                return stripeProducts
            }
            catch (error) {
                if (error.message.indexOf('exists') > -1) {
                    return stripeProducts
                }
                else {
                    throw error
                }
            }
        }
    }

    public async createSkus(products: Product[]): Promise<Stripe.skus.ISku[]> {
        if (products.some((product) => product.isParent)) {
            throw new Error('Attempted to create Stripe skus from parent products.')
        }
        if (!products || !products.length || products.every((product) => product.isEnteredIntoStripe)) {
            return []
        }
        if (products.some((product) => product.stockQuantity === 0)) {
            throw new Error(Copy.ErrorMessages.itemOutOfStockError)
        }
        const stripeCreateProductPromises: Promise<Stripe.skus.ISku>[] = []
        let stripeProducts: Stripe.skus.ISku[]

        for (const dbProduct of products) {
            try {
                stripeCreateProductPromises.push(stripe.skus.create(
                    this._getSkuCreationOptionsFromProduct(dbProduct)
                ))
                stripeProducts = await Promise.all(stripeCreateProductPromises)
                return stripeProducts
            }
            catch (error) {
                if (error.message.indexOf('exists') > -1) {
                    return stripeProducts
                }
                else {
                    throw error
                }
            }
        }
    }

    private _getProductCreationOptionsFromProduct(product: Product): Stripe.products.IProductCreationOptions {
        return {
            id: product.sku,
            name: product.name,
            description: product.description,
            type: 'good',
        }
    }

    private _getSkuCreationOptionsFromProduct(product: Product): Stripe.skus.ISkuCreationOptions {
        const priceAmount = (this.productService.determinePrice(product) as Price).amount
        return {
            id: product.sku,
            product: product.parentSku,
            currency: product.price.currency,
            inventory: {
                quantity: product.stockQuantity,
                type: 'finite',
            },
            // Stripe stores price in the lowest denomination.
            // By multiplying by 100, we're assuming USD.
            price: priceAmount * 100,
        }
    }
}
