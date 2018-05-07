import { Types } from '@mte/common/constants/inversify/types'
import { Wishlist, WishlistModel } from '@mte/common/models/api-models/wishlist'
import { inject, injectable } from 'inversify'
import { DbClient } from '../data-access/db-client'
import { CrudService } from './crud.service'

/**
 * Methods for querying the `taxonomies` collection
 *
 * @export
 * @class WishlistService
 * @extends {CrudService<Wishlist>}
 */
@injectable()
export class WishlistService extends CrudService<Wishlist> {
    public model = WishlistModel

    constructor(
        @inject(Types.DbClient) protected dbClient: DbClient<Wishlist>,
    ) {
        super()
    }
}
