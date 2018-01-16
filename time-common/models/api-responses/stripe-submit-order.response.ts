import { StripeOrder } from '@time/common/lib/stripe-order'
import { Order } from '@time/common/models/api-models/order'
import { ApiResponse } from '@time/common/models/api-responses/api.response'

export interface IStripeSubmitOrderData {
    order: Order
    stripeOrder: StripeOrder
}

export class StripeSubmitOrderResponse extends ApiResponse<IStripeSubmitOrderData> { }
