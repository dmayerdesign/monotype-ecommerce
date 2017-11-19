import { Order } from '@time/common/models/api-models/order'
import { StripeOrder } from '@time/common/models/helpers'
import { ApiResponse } from '@time/common/models/helpers/api-response'

export interface IStripePayOrderData {
    paidOrder: Order
    paidStripeOrder: StripeOrder
}

export class StripePayOrderResponse extends ApiResponse<IStripePayOrderData> { }
