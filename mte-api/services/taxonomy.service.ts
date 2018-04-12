import { Types } from '@mte/common/constants/inversify/types'
import { Taxonomy, TaxonomyModel } from '@mte/common/models/api-models/taxonomy'
import { inject, injectable } from 'inversify'
import { DbClient } from '../data-access/db-client'
import { CrudService } from './crud.service'

/**
 * Methods for querying the `taxonomies` collection
 *
 * @export
 * @class TaxonomyService
 * @extends {CrudService<Taxonomy>}
 */
@injectable()
export class TaxonomyService extends CrudService<Taxonomy> {
    public model = TaxonomyModel

    constructor(
        @inject(Types.DbClient) protected dbClient: DbClient<Taxonomy>,
    ) {
        super()
    }
}
