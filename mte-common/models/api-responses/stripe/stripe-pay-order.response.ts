import { Order } from '@mte/common/models/api-models/order'
import { ApiResponse } from '@mte/common/models/api-responses/api.response'
import * as Stripe from 'stripe'

export class StripePayOrderResponseBody {
    public paidOrder: Order
    public paidStripeOrder: Stripe.orders.IOrder
}

export class StripePayOrderResponse extends ApiResponse<StripePayOrderResponseBody> { }
