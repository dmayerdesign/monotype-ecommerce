import { inject, injectable } from 'inversify'
import { Document } from 'mongoose'
import * as Stripe from 'stripe'

import { Types } from '@mte/common/constants/inversify'
import { StripeOrder } from '@mte/common/lib/stripe-order'
import { Discount } from '@mte/common/models/api-models/discount'
import { Order } from '@mte/common/models/api-models/order'
import { Price } from '@mte/common/models/api-models/price'
import { Product } from '@mte/common/models/api-models/product'
import { GetProductsFromIdsRequest } from '@mte/common/models/api-requests/get-products.request'
import { ListFromIdsRequest } from '@mte/common/models/api-requests/list.request'
import { ApiErrorResponse } from '@mte/common/models/api-responses/api-error.response'
import { ApiResponse } from '@mte/common/models/api-responses/api.response'
import { StripeCreateOrderResponse } from '@mte/common/models/api-responses/stripe/stripe-create-order.response'
import { StripePayOrderResponse } from '@mte/common/models/api-responses/stripe/stripe-pay-order.response'
import { OrderStatus } from '@mte/common/models/enums/order-status'
import { DbClient } from '../../data-access/db-client'
import { DiscountService } from '../discount.service'
import { ProductService } from '../product.service'
import { ProductHelper } from '@mte/common/helpers/product.helper';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

/**
 * Stripe service
 *
 * @export
 * @class StripeOrderService
 * @description Methods for interacting with the Stripe Orders API
 */
@injectable()
export class StripeOrderActionsService {

    constructor(
        @inject(Types.DbClient) private dbClient: DbClient<Order>,
        @inject(Types.ProductService) private productService: ProductService,
        @inject(Types.DiscountService) private discountService: DiscountService
    ) {}

    /**
     * Create a Stripe order
     *
     * @public
     * @param {Order} order An order in the database
     * @returns {Promise<StripeCreateOrderResponse>}
     * @memberof StripeService
     */
    public createOrder(order: Order) {
        return new Promise<StripeCreateOrderResponse>(async (resolve, reject) => {
            let orderItems: Product[]
            let orderDiscounts: Discount[]

            if (!order.total
                || !order.total.currency
                || !order.customer.email) {
                reject(new Error('Not a valid order'))
            }

            order.total.amount = 0

            try {
                const orderItemsRequest = new GetProductsFromIdsRequest()
                orderItemsRequest.ids = order.items as string[]
                const orderItemsResponse = await this.productService.get(orderItemsRequest)
                orderItems = orderItemsResponse.body
                orderItems.forEach(orderItem => {
                    order.total.amount += (ProductHelper.getPrice(orderItem) as Price).amount
                })
            }
            catch (getItemsError) {
                reject(getItemsError)
            }

            try {
                const orderDiscountsRequest = new ListFromIdsRequest({ ids: order.discounts })
                const orderDiscountsResponse = await this.discountService.getIds(orderDiscountsRequest)
                orderDiscounts = orderDiscountsResponse.body
                orderDiscounts.forEach(orderDiscount => {
                    order.total.amount -= orderDiscount.total.amount
                })
            }
            catch (getDiscountsError) {
                reject(getDiscountsError)
            }

            const dbOrder = new Order(order)

            // Build the stripe order.
            const stripeOrder = new StripeOrder()

            stripeOrder.shipping = {
                name: order.customer.firstName + ' ' + order.customer.lastName,
                address: {
                    line1: order.customer.shippingAddress.street1,
                    line2: order.customer.shippingAddress.street2,
                    city: order.customer.shippingAddress.city,
                    state: order.customer.shippingAddress.state,
                    country: order.customer.shippingAddress.country,
                    postal_code: order.customer.shippingAddress.zip,
                },
            }
            stripeOrder.currency = <string>order.total.currency
            stripeOrder.customer = order.customer.stripeCustomerId
            stripeOrder.email = order.customer.email
            stripeOrder.items = orderItems.map(product => {
                return <StripeNode.orders.IOrderItem>{
                    parent: product.sku,
                    quantity: product.stockQuantity,
                }
            })

            console.log(`
--------------------------------
        The Stripe order
--------------------------------`)
            console.log(stripeOrder)

            try {
                const newStripeOrder = await stripe.orders.create(<StripeNode.orders.IOrderCreationOptions>stripeOrder)
                dbOrder.stripeOrderId = newStripeOrder.id
                const newOrder = await dbOrder.save()
                resolve(new StripeCreateOrderResponse({
                    order: newOrder._doc,
                    stripeOrder: <StripeOrder>newStripeOrder
                }))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    /**
     * @description Pay a stripe order
     * @public
     * @param {Order} order An order from the database
     * @returns {Promise<StripePayOrderResponse>}
     * @memberof StripeService
     */
    public payOrder(order: Order) {
        return new Promise<StripePayOrderResponse>(async (resolve, reject) => {
            const payment: StripeNode.orders.IOrderPayOptions = {
                metadata: {
                    orderID: order._id,
                },
            }
            console.log('******** order.stripeToken ********')
            console.log(order.stripeToken)

            if (order.customer.stripeCustomerId && !order.stripeToken && !order.stripeCardId) {
                payment.customer = order.customer.stripeCustomerId
            }
            else if ((order.stripeToken || order.stripeCardId) && order.customer.email) {
                payment.source = order.stripeToken || order.stripeCardId
                payment.email = order.customer.email
            }
            else {
                return reject(new Error('Missing one of: Stripe Customer ID, Stripe Token ID, or email'))
            }

            if (order.savePaymentInfo && order.stripeToken && order.customer.stripeCustomerId) {
                delete payment.source
                delete payment.email
                payment.customer = order.customer.stripeCustomerId

                try {
                    console.log('******** Saving new card ********')
                    const card = await stripe.customers.createSource(order.customer.stripeCustomerId, { source: order.stripeToken })
                    if (!card) return reject(new Error('Couldn\'t save your payment info. Please try again.'))
                    await stripe.customers.update(order.customer.stripeCustomerId, {
                        default_source: card.id
                    })
                    makePayment()
                }
                catch (error) {
                    reject(error)
                }
            } else {
                makePayment()
            }

            async function makePayment() {
                try {
                    const paidStripeOrder = await <Promise<StripeOrder>>stripe.orders.pay(order.stripeOrderId, payment)
                    let paidOrder = await this.dbClient.findById(Order, order._id) as Order
                    paidOrder.status = OrderStatus.Paid
                    const paidOrderResponse = await paidOrder.save()
                    paidOrder = paidOrderResponse._doc
                    resolve(new StripePayOrderResponse({
                        paidOrder,
                        paidStripeOrder,
                    }))
                }
                catch (error) {
                    reject(new ApiErrorResponse(error))
                }
            }
        })
    }
}
