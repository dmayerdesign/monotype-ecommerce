import { StripeOrder } from '@time/common/lib/stripe-order'
import { Order } from '@time/common/models/api-models/order'
import { ApiResponse } from '@time/common/models/api-responses/api.response'

export class StripePayOrderResponseBody {
    public paidOrder: Order
    public paidStripeOrder: StripeOrder
}

export class StripePayOrderResponse extends ApiResponse<StripePayOrderResponseBody> { }
