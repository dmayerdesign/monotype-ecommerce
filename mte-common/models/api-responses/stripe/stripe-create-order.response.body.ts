import { StripeOrder } from '@mte/common/lib/stripe-order'
import { Order } from '@mte/common/models/api-models/order'

export class StripeCreateOrderResponseBody {
    public order: Order
    public stripeOrder: StripeOrder
}
