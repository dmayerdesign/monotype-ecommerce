import { StripeOrder } from '@mte/common/lib/stripe-order'
import { Order } from '@mte/common/models/api-models/order'
import { ApiResponse } from '@mte/common/models/api-responses/api.response'

export class StripeSubmitOrderResponseBody {
    public order: Order
    public stripeOrder: StripeOrder
}

export class StripeSubmitOrderResponse extends ApiResponse<StripeSubmitOrderResponseBody> { }
