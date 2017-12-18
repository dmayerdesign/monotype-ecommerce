import { inject, injectable } from 'inversify'
import { Document } from 'mongoose'
import 'stripe'

import { AppConfig } from '@time/app-config'
import { Types } from '@time/common/constants/inversify'
import { Order } from '@time/common/models/api-models/order'
import { Organization, OrganizationModel } from '@time/common/models/api-models/organization'
import { Product, ProductModel } from '@time/common/models/api-models/product'
import { StripeSubmitOrderResponse } from '@time/common/models/api-responses/stripe-submit-order.response'
import { ApiErrorResponse } from '@time/common/models/helpers/api-error-response'
import { DbClient } from '../../data-access/db-client'
import { EmailService } from '../email.service'
import { StripeCustomerService } from './stripe-customer.service'
import { StripeOrderActionsService } from './stripe-order-actions.service'
import { StripeProductService } from './stripe-product.service'

/**
 * Stripe service
 *
 * @export
 * @class StripeService
 * @description Methods for interacting with the Stripe API
 */
@injectable()
export class StripeOrderService {

    constructor(
        @inject(Types.DbClient) private dbClient: DbClient<any>,
        @inject(Types.EmailService) private email: EmailService,
        @inject(Types.StripeCustomerService) private stripeCustomerService: StripeCustomerService,
        @inject(Types.StripeOrderActionsService) private stripeOrderActionsService: StripeOrderActionsService,
        @inject(Types.StripeProductService) private stripeProductService: StripeProductService,
    ) {}

    /**
     * Submit an order. Creates an order in Stripe, and immediately pays it
     *
     * @param {Order} orderData An object representing the order to be created and paid
     * @param {Product[]} variationsAndStandalones Products from the database representing the variations and standalone products purchased
     */
    public submitOrder(orderData: Order, variationsAndStandalones: Product[]) {
        return new Promise<StripeSubmitOrderResponse>(async (resolve, reject) => {
            const parentSkus = []
            const productSkus = []
            variationsAndStandalones.forEach(product => {
                productSkus.push(product.sku)
                if (product.isVariation && product.parentSku) {
                    parentSkus.push(product.parentSku)
                    productSkus.push(product.parentSku)
                }
            })

            try {
                // Retrieve parent products and combine them with `variationsAndStandalones` into `products`
                // Use the new `products` array to create the products and SKUs in Stripe, if they don't exist
                const parents = await this.dbClient.find(ProductModel, { sku: { $in: parentSkus } }) as Product[]
                const products = parents.concat(variationsAndStandalones)
                await this.stripeProductService.createProducts(products)
                console.log("Created products")
                await this.stripeProductService.createSkus(products, orderData)
                console.log("Created SKUs")

                // Create the order in Stripe
                const createOrderResponse = await this.stripeOrderActionsService.createOrder(orderData)
                const { order } = createOrderResponse.data

                // Create the customer in Stripe
                const stripeCustomer = await this.stripeCustomerService.createCustomer(order)

                // Update the order with the Stripe customer info
                order.customer.stripeCustomerId = stripeCustomer.id

                // Pay the order
                const payOrderResponse = await this.stripeOrderActionsService.payOrder(order)
                const { paidOrder, paidStripeOrder } = payOrderResponse.data

                // Update the stock quantity and total sales of each variation and standalone
                this.stripeProductService.updateInventory(products, paidOrder)

                const organization = await this.dbClient.findOne(OrganizationModel, {}) as Organization

                await this.email.sendReceipt({
                    organization,
                    order: paidOrder,
                    fromEmail: AppConfig.organization_email,
                    fromName: AppConfig.brand_name,
                    toEmail: paidOrder.customer.email,
                    toName: paidOrder.customer.firstName + ' ' + paidOrder.customer.lastName,
                })

                resolve(new StripeSubmitOrderResponse({
                    order: paidOrder,
                    stripeOrder: paidStripeOrder,
                }))
            }
            catch (error) {
                if (error instanceof ApiErrorResponse) {
                    reject(error)
                }
                else {
                    reject(new ApiErrorResponse(error))
                }
            }
        })
    }
}
