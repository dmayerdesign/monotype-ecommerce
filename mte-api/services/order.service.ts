import { inject, injectable } from 'inversify'

import { Types } from '@mte/common/constants/inversify/types'
import { Order } from '@mte/common/models/api-models/order'
import { ApiErrorResponse } from '@mte/common/models/api-responses/api-error.response'
import { StripeSubmitOrderResponse } from '@mte/common/models/api-responses/stripe/stripe-submit-order.response'
import { DbClient } from '../data-access/db-client'
import { CrudService } from './crud.service'
import { StripeOrderService } from './stripe/stripe-order.service'

/**
 * TODO:
 * - Create a way to extract useful data from orders
 * -- e.g. Which items did people purchase together?
 * -- Maybe create a `ProductRecommendationData` entity
 * --- { productId: string, purchasedWithProducts: { productId: string, count: number }[] }
 */
@injectable()
export class OrderService extends CrudService<Order> {

    protected model = Order

    constructor(
        @inject(Types.DbClient) protected dbClient: DbClient<Order>,
        @inject(Types.StripeOrderService) private stripeOrderService: StripeOrderService,
    ) { super() }

    public execute(newOrder: Order): Promise<StripeSubmitOrderResponse> {
        return new Promise<StripeSubmitOrderResponse>(async (resolve, reject) => {
            try {
                const stripeSubmitOrderResponse = await this.stripeOrderService.submitOrder(newOrder)
                resolve(stripeSubmitOrderResponse)
            }
            catch (error) {
                reject(error as ApiErrorResponse)
            }
        })
    }
}
