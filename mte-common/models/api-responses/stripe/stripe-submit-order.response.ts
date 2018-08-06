import { Order } from '@mte/common/models/api-models/order'
import { ApiResponse } from '@mte/common/models/api-responses/api.response'
import * as Stripe from 'stripe'

export class StripeSubmitOrderResponseBody {
    public order: Order
    public stripeOrder: Stripe.orders.IOrder
}

export class StripeSubmitOrderResponse extends ApiResponse<StripeSubmitOrderResponseBody> { }
