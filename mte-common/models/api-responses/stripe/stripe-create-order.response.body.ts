import { Order } from '@mte/common/models/api-models/order'
import * as Stripe from 'stripe'

export class StripeCreateOrderResponseBody {
    public order: Order
    public stripeOrder: Stripe.orders.IOrder
}
