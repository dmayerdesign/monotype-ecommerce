import { Order } from '@time/common/models/api-models/order'
import { StripeOrder } from '@time/common/models/helpers'
import { ApiResponse } from '@time/common/models/helpers/api-response'

export interface IStripeSubmitOrderData {
    order: Order
    stripeOrder: StripeOrder
}

export class StripeSubmitOrderResponse extends ApiResponse<IStripeSubmitOrderData> { }
