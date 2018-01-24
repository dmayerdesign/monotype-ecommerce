import { StripeOrder } from '@time/common/lib/stripe-order'
import { Order } from '@time/common/models/api-models/order'

export class StripeCreateOrderResponseBody {
    public order: Order
    public stripeOrder: StripeOrder
}
