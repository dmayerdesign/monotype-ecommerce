import { Request } from 'express'
import { inject, injectable } from 'inversify'

import { Copy } from '@mte/common/constants/copy'
import { HttpStatus } from '@mte/common/constants/http-status'
import { Types } from '@mte/common/constants/inversify/types'
import { NavigationItem } from '@mte/common/models/api-models/navigation-item'
import { Organization } from '@mte/common/models/api-models/organization'
import { ApiErrorResponse } from '@mte/common/models/api-responses/api-error.response'
import { ApiResponse } from '@mte/common/models/api-responses/api.response'
import { DbClient } from '../data-access/db-client'
import { CrudService } from './crud.service'

@injectable()
export class OrganizationService extends CrudService<Organization> {

    protected model = Organization

    constructor(
        @inject(Types.DbClient) protected dbClient: DbClient<Organization>
    ) {
        super()
    }

    public getOrganization(): Promise<ApiResponse<Organization>> {
        return new Promise<ApiResponse<Organization>>(async (resolve, reject) => {
            try {
                const organization = await this.dbClient.findOne(Organization, {}, [
                    {
                        path: 'storeUiContent.primaryNavigation',
                        populate: {
                            path: 'children',
                            model: NavigationItem.getModel(),
                        },
                    },
                ])

                if (!organization) {
                    reject(new ApiErrorResponse(new Error(Copy.ErrorMessages.findOrganizationError), HttpStatus.CLIENT_ERROR_NOT_FOUND))
                    return
                }

                resolve(new ApiResponse(organization))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public create(): any {
        return super.create([
            {
                name: 'Hyzer Shop',
                retailSettings: {
                    salesTaxPercentage: 6,
                    addSalesTax: false,
                    shippingFlatRate: { amount: 5, currency: 'USD' },
                },
                branding: {
                    logo: 'https://d1eqpdomqeekcv.cloudfront.net/branding/hyzershop-wordmark-250.png',
                    colors: { primary: '#00b0ff' },
                    cartName: 'basket',
                },
                storeUiContent: {
                    primaryNavigation: [
                        '5a85163ea5697de9dc39d4ae',
                        '5a85163ea5697de9dc39d4af',
                        '5a85163ea5697de9dc39d4b0',
                        '5a85163ea5697de9dc39d4b1',
                        '5a85163ea5697de9dc39d4b2',
                        '5a85163ea5697de9dc39d4b3',
                        '5a85163ea5697de9dc39d4b4',
                    ],
                },
            },
        ])
    }
}
