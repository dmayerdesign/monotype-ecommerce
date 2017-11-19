import { Order } from '@time/common/models/api-models/order'
import { StripeOrder } from '@time/common/models/helpers'
import { ApiResponse } from '@time/common/models/helpers/api-response'

export interface IStripeCreateOrderData {
    order: Order
    stripeOrder: StripeOrder
}

export class StripeCreateOrderResponse extends ApiResponse<IStripeCreateOrderData> { }
