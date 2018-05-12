import { inject, injectable } from 'inversify'
import { Document } from 'mongoose'
import 'stripe'

import { AppConfig } from '@mte/app-config'
import { HttpStatus } from '@mte/common/constants'
import { Types } from '@mte/common/constants/inversify'
import { UserHelper } from '@mte/common/helpers/user.helper'
import { Order } from '@mte/common/models/api-models/order'
import { Organization } from '@mte/common/models/api-models/organization'
import { Product } from '@mte/common/models/api-models/product'
import { FindProductError } from '@mte/common/models/api-models/product'
import { ListFromIdsRequest, ListFromQueryRequest } from '@mte/common/models/api-requests/list.request'
import { ApiErrorResponse } from '@mte/common/models/api-responses/api-error.response'
import { StripeSubmitOrderResponse } from '@mte/common/models/api-responses/stripe/stripe-submit-order.response'
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
    public submitOrder(orderData: Order) {
        return new Promise<StripeSubmitOrderResponse>(async (resolve, reject) => {
            const variationAndStandaloneSKUs: string[] = []
            const parentIds: string[] = []

            let variationsAndStandalones: Product[]

            orderData.items.forEach(orderProduct => {
                variationAndStandaloneSKUs.push((orderProduct as Product).sku)
            })

            try {
                const request = new ListFromQueryRequest({
                    query: { SKU: { $in: variationAndStandaloneSKUs } },
                    limit: 0,
                })
                variationsAndStandalones = await this.dbClient.findQuery<Product>(Product, request)
                if (!variationsAndStandalones || !variationsAndStandalones.length) {
                    reject(new ApiErrorResponse(new FindProductError(), HttpStatus.CLIENT_ERROR_NOT_FOUND))
                }
            }
            catch (findProductsError) {
                reject(new ApiErrorResponse(findProductsError))
            }

            variationsAndStandalones.forEach(product => {
                if (product.isVariation && product.parentSku) {
                    parentIds.push(product.parentSku)
                }
            })

            try {
                // Retrieve parent products and combine them with `variationsAndStandalones` into `products`.
                // Use the new `products` array to create the products and SKUs in Stripe, if they don't exist.
                const findParentsRequest = new ListFromIdsRequest({
                    ids: parentIds,
                    limit: 0
                })
                const parents = await this.dbClient.findIds(Product, findParentsRequest)
                const products = parents.concat(variationsAndStandalones)
                await this.stripeProductService.createProducts(products)
                console.log('Created products')
                await this.stripeProductService.createSkus(products, orderData)
                console.log('Created SKUs')

                // Create the order in Stripe.
                const createOrderResponse = await this.stripeOrderActionsService.createOrder(orderData)
                const { order } = createOrderResponse.body

                // Create the customer in Stripe.
                const stripeCustomer = await this.stripeCustomerService.createCustomer(order)

                // Update the order with the Stripe customer info.
                order.customer.stripeCustomerId = stripeCustomer.id

                // Pay the order.
                const payOrderResponse = await this.stripeOrderActionsService.payOrder(order)
                const { paidOrder, paidStripeOrder } = payOrderResponse.body

                // Update the stock quantity and total sales of each variation and standalone.
                this.stripeProductService.updateInventory(products, paidOrder)

                const organization = await this.dbClient.findOne(Organization, {})

                await this.email.sendReceipt({
                    organization,
                    order: paidOrder,
                    toEmail: paidOrder.customer.email,
                    toName: UserHelper.getFullName(paidOrder.customer)
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
