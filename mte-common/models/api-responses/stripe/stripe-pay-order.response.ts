import { StripeOrder } from '@mte/common/lib/stripe-order'
import { Order } from '@mte/common/models/api-models/order'
import { ApiResponse } from '@mte/common/models/api-responses/api.response'

export class StripePayOrderResponseBody {
    public paidOrder: Order
    public paidStripeOrder: StripeOrder
}

export class StripePayOrderResponse extends ApiResponse<StripePayOrderResponseBody> { }
