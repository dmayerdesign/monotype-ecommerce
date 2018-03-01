import { inject, injectable } from 'inversify'

import { Types } from '@mte/common/constants/inversify'
import { Discount, DiscountModel } from '@mte/common/models/api-models/discount'
import { DbClient } from '../data-access/db-client'
import { CrudService } from './crud.service'

/**
 * Service for fetching documents from the `discounts` collection
 */
@injectable()
export class DiscountService extends CrudService<Discount> {

    protected model = DiscountModel

    constructor(
        @inject(Types.DbClient) protected dbClient: DbClient<Discount>
    ) {
        super()
    }

}
