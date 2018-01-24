import { Request } from 'express'
import { inject, injectable } from 'inversify'

import { Types } from '@time/common/constants/inversify/types'
import { Organization, OrganizationModel } from '@time/common/models/api-models/organization'
import { ApiResponse } from '@time/common/models/api-responses/api.response'
import { DbClient } from '../data-access/db-client'
import { CrudService } from './crud.service'

@injectable()
export class OrganizationService extends CrudService<Organization> {

    protected model = OrganizationModel

    constructor(
        @inject(Types.DbClient) protected dbClient: DbClient<Organization>
    ) {
        super()
    }

    public getOrganization(): Promise<ApiResponse<Organization>> {
        const testOrg: Organization = {
            name: 'Hyzer Shop',
            retailSettings: {
                salesTaxPercentage: 6,
            },
        }

        return new Promise<ApiResponse<Organization>>(async (resolve, reject) => {
            resolve(new ApiResponse(testOrg))
        })
    }
}
