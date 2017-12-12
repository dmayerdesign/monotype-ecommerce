import { inject, injectable } from 'inversify'
import { Document } from 'mongoose'
import * as Stripe from 'stripe'

import { CurrencyEnum } from '@time/common/constants/currency'
import { Types } from '@time/common/constants/inversify'
import { Order } from '@time/common/models/api-models/order'
import { Product, ProductModel } from '@time/common/models/api-models/product'
import {
    StripeCreateProductsOrSkusResponse,
} from '@time/common/models/api-responses/stripe-create-products-or-skus.response'
import { IStripeCreateProductsOrSkusData } from '@time/common/models/api-responses/stripe-create-products-or-skus.response'
import { ProductService } from '../product.service'

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

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
    ) {}

    private createProductsOrSkus<T extends StripeNode.products.IProduct|StripeNode.skus.ISku>(which: 'products'|'skus', products: (Product & Document)[], order: Order & Document) {
        return new Promise<IStripeCreateProductsOrSkusData<StripeNode.products.IProduct|StripeNode.skus.ISku>>((resolve, reject) => {
            const productsToAdd = []
            let outOfStock = false

            if (!products || !products.length) {
                resolve({
                    products: [],
                    stripeProductsOrSkus: [],
                })
                return
            }

            products.forEach(product => {
                if (product.stockQuantity < 1 && product.stockQuantity !== -1) {
                    outOfStock = true
                }
            })

            if (outOfStock) {
                reject(new Error("Oh no — one of your chosen items is out of stock!"))
                return
            }

            if (products.every(product => product.isEnteredIntoStripe)) {
                resolve({
                    products,
                    stripeProductsOrSkus: [],
                })
                return
            }

            if (which === "products") {
                console.log("Let's make some products")
                console.log(products)
                products.forEach(product => {
                    const productId = product.isStandalone ? product.SKU + "_parent" : product.SKU
                    if (!product.isEnteredIntoStripe && !product.isVariation) {
                        productsToAdd.push({
                            id: productId,
                            name: product.name,
                            attributes: ["_id"],
                        })
                    }
                })
            }
            else if (which === "skus") {
                console.log("Let's make some SKUs")
                products.forEach(product => {
                    console.log(product)
                    const thePrice = this.productService.determinePrice(product)
                    const productToAdd: any = {
                        id: product.SKU,
                        price: thePrice.total * 100,
                        currency: order.total.currency || CurrencyEnum.USD,
                        inventory: {
                            quantity: product.stockQuantity,
                            type: "finite",
                        },
                        attributes: {
                            "_id": product._id,
                        },
                    }
                    if (!product.isEnteredIntoStripe && !product.isParent) {
                        productToAdd.product = product.isStandalone ? product.SKU + "_parent" : product.parentSKU
                        productsToAdd.push(productToAdd)
                    }
                })
            }

            console.log(productsToAdd)

            this.createStripeProductsOrSkus<T>(which, productsToAdd)
                .then(stripeProductsOrSkus => {
                    const query = { SKU: { $in: [] } }
                    if (!stripeProductsOrSkus) return resolve({
                        products,
                        stripeProductsOrSkus: [],
                    })

                    products.forEach(product => {
                        if (!product.isEnteredIntoStripe) {
                            query.SKU.$in.push(product.SKU)
                        }
                    })

                    ProductModel
                        .update(
                            query,
                            {
                                $set: { enteredIntoStripe: true },
                            },
                            { multi: true })
                        .then(updatedProducts => {
                            resolve({
                                products: updatedProducts,
                                stripeProductsOrSkus,
                            })
                        })
                        .catch(updateProductsError => {
                            reject(updateProductsError)
                        })
                })
                .catch(() => {
                    resolve({
                        products,
                        stripeProductsOrSkus: [],
                    })
                })
        })
    }

    private createStripeProductsOrSkus<T>(which: 'products'|'skus', products) {
        return new Promise<Array<T>>((resolve, reject) => {
            recursivelyCreateProductsOrSKUs(products)

            async function recursivelyCreateProductsOrSKUs(productArr) {
                const stripeProducts = {
                    products: [],
                    skus: [],
                }

                console.log(`*********** Creating a ${which.substring(0, which.length - 1)} ************`)
                console.log(productArr)
                console.log(productArr[0])

                let product: StripeNode.products.IProduct | StripeNode.skus.ISku

                try {
                    if (which === "products") {
                        product = await stripe.products.create(productArr[0])
                    }
                    else {
                        product = await stripe.skus.create(productArr[0])
                    }

                    const logMsg = which === "skus" ? "SKU" : "product"
                    console.log(`
    ---------------------------------------
    Created the ${logMsg} in Stripe
    ---------------------------------------`)
                    console.log(product.id)

                    stripeProducts[which].push(product)
                    productArr.shift()

                    if (productArr.length) {
                        recursivelyCreateProductsOrSKUs(productArr)
                    }
                    else {
                        resolve(stripeProducts[which])
                    }
                }
                catch (error) {
                    if (error.message.indexOf("already exists") > -1) {
                        return resolve(stripeProducts[which])
                    }
                    reject(error)
                }
            }
        })
    }

    /**
     * Create Parent and Standalone products in Stripe
     *
     * @param {Product[]} products - Array of Parent and Standalone products to add to Stripe
     */
    public createProducts(products: (Product & Document)[]) {
        return new Promise<StripeCreateProductsOrSkusResponse<StripeNode.products.IProduct>>(async (resolve, reject) => {
            try {
                const createStripeProductsResponseData = await this.createProductsOrSkus<StripeNode.products.IProduct>('products', products, null)
                resolve(new StripeCreateProductsOrSkusResponse<StripeNode.products.IProduct>(<IStripeCreateProductsOrSkusData<StripeNode.products.IProduct>>createStripeProductsResponseData))
            }
            catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Create SKUs in Stripe
     *
     * @param {Product[]} products - Array of Standalone products and product Variations to add to Stripe
     * @param {Order} order - The order containing references to the products being added
     */
    public createSkus(products: (Product & Document)[], order: Order & Document) {
        return new Promise<StripeCreateProductsOrSkusResponse<StripeNode.skus.ISku>>(async (resolve, reject) => {
            try {
                const createStripeProductsResponseData = await this.createProductsOrSkus<StripeNode.skus.ISku>('products', products, order)
                resolve(new StripeCreateProductsOrSkusResponse<StripeNode.skus.ISku>(<IStripeCreateProductsOrSkusData<StripeNode.skus.ISku>>createStripeProductsResponseData))
            }
            catch (error) {
                reject(error)
            }
        })
    }

    public updateInventory(products, order) {
        const productPromises: Promise<Product & Document>[] = []

        products.forEach(product => {
            productPromises.push(
                new Promise<Product & Document>((resolve, reject) => {
                    let qty = 0
                    if (product.isParent) {
                        const variations = products.map(p => p.parentSKU === product.SKU)
                        const variationSKUs = variations.map(v => v.SKU)
                        const orderVariations = order.items.filter(op => variationSKUs.indexOf(op.SKU) > -1)
                        orderVariations.forEach(ov => qty += ov.quantity)
                    }
                    else {
                        qty = order.items.find(op => op.SKU === product.SKU).quantity
                    }
                    return ProductModel.update(
                        { SKU: product.SKU },
                        { $inc: { stockQuantity: -qty, totalSales: qty } }
                    )
                })
            )
        })

        return Promise.all(productPromises)
    }
}
