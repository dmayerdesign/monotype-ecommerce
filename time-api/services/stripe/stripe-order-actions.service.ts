import { inject, injectable } from 'inversify'
import * as Stripe from 'stripe'

import { Types } from '@time/common/constants/inversify'
import { Discount } from '@time/common/models/api-models/discount'
import { Order, OrderModel } from '@time/common/models/api-models/order'
import { Product } from '@time/common/models/api-models/product'
import { GetProductsRequest } from '@time/common/models/api-requests/get-products.request'
import { StripeCreateOrderResponse } from '@time/common/models/api-responses/stripe-create-order.response'
import { StripePayOrderResponse } from '@time/common/models/api-responses/stripe-pay-order.response'
import { StripeOrder } from '@time/common/models/helpers'
import { ApiErrorResponse } from '@time/common/models/helpers/api-error-response'
import { ApiResponse } from '@time/common/models/helpers/api-response'
import { DiscountService } from '../discount.service'
import { ProductService } from '../product.service'

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
                reject(new Error("Not a valid order"))
            }

            order.total.total = 0

            try {
                const orderItemsRequest = new GetProductsRequest()
                orderItemsRequest.ids = <string[]>order.items
                const orderItemsResponse = await <Promise<ApiResponse<Product[]>>>this.productService.get(orderItemsRequest)
                orderItems = orderItemsResponse.data
                orderItems.forEach(orderItem => {
                    order.total.total += this.productService.getPrice(orderItem).total
                })
            }
            catch (getItemsError) {
                reject(getItemsError)
            }

            try {
                const orderDiscountsResponse = await this.discountService.get({ _id: { $in: order.discounts } })
                orderDiscounts = orderDiscountsResponse.data
                orderDiscounts.forEach(orderDiscount => {
                    order.total.total -= orderDiscount.amount.total
                })
            }
            catch (getDiscountsError) {
                reject(getDiscountsError)
            }

            const dbOrder = new OrderModel(order)

            // Build the stripe order
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
                    parent: product.SKU,
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
                    order: newOrder,
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
            console.log("******** order.stripeToken ********")
            console.log(order.stripeToken)

            if (order.customer.stripeCustomerId && !order.stripeToken && !order.stripeCardId) {
                payment.customer = order.customer.stripeCustomerId
            }
            else if ((order.stripeToken || order.stripeCardId) && order.customer.email) {
                payment.source = order.stripeToken || order.stripeCardId
                payment.email = order.customer.email
            }
            else {
                return reject(new Error("Missing one of: Stripe Customer ID, Stripe Token ID, or email"))
            }

            if (order.savePaymentInfo && order.stripeToken && order.customer.stripeCustomerId) {
                delete payment.source
                delete payment.email
                payment.customer = order.customer.stripeCustomerId

                try {
                    console.log("******** Saving new card ********")
                    const card = await stripe.customers.createSource(order.customer.stripeCustomerId, { source: order.stripeToken })
                    if (!card) return reject(new Error("Couldn't save your payment info. Please try again."))
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
                    let paidOrder = await OrderModel.findById(order._id)
                    paidOrder.status = 'Paid'
                    paidOrder = await paidOrder.save()
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
