import { Order } from '@mte/common/api/entities/order'
import { StripeSubmitOrderResponse } from '@mte/common/api/responses/stripe/stripe-submit-order.response'

export interface OrderService {
    place(newOrder: Order): Promise<StripeSubmitOrderResponse>
}
