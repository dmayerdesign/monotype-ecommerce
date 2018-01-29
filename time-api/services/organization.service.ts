import { Request } from 'express'
import { inject, injectable } from 'inversify'

import { Copy } from '@time/common/constants/copy'
import { HttpStatus } from '@time/common/constants/http-status'
import { Types } from '@time/common/constants/inversify/types'
import { Organization, OrganizationModel } from '@time/common/models/api-models/organization'
import { ApiErrorResponse } from '@time/common/models/api-responses/api-error.response'
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
        return new Promise<ApiResponse<Organization>>(async (resolve, reject) => {
            try {
                const organization = await this.dbClient.findOne(OrganizationModel, {})

                if (!organization) {
                    reject(new ApiErrorResponse(new Error(Copy.ErrorMessages.findOrganizationError), HttpStatus.CLIENT_ERROR_notFound))
                    return
                }

                resolve(new ApiResponse(organization))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }
}
