import { inject, injectable } from 'inversify'

import { Types } from '@mte/common/constants/inversify/types'
import { Order, OrderModel } from '@mte/common/models/api-models/order'
import { ApiErrorResponse } from '@mte/common/models/api-responses/api-error.response'
import { StripeSubmitOrderResponse } from '@mte/common/models/api-responses/stripe/stripe-submit-order.response'
import { DbClient } from '../data-access/db-client'
import { CrudService } from './crud.service'
import { StripeOrderService } from './stripe/stripe-order.service'

@injectable()
export class OrderService extends CrudService<Order> {

    protected model = OrderModel

    constructor(
        @inject(Types.DbClient) protected dbClient: DbClient<Order>,
        @inject(Types.StripeOrderService) private stripeOrderService: StripeOrderService,
    ) {
        super()
    }

    public execute(newOrder: Order) {
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
