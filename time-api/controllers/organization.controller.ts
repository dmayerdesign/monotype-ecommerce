import * as express from 'express'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import {
    controller,
    httpDelete,
    httpGet,
    httpPost,
    httpPut,
    interfaces,
    queryParam,
    request,
    requestParam,
    response,
} from 'inversify-express-utils'

import { Types } from '@time/common/constants'
import { IOrganization } from '@time/common/models/interfaces'
import { ProductService } from '../services'
import { WoocommerceMigrationService } from '../services'

@injectable()
@controller('/api/organization')
export class OrganizationController implements interfaces.Controller {

    constructor(
        // @inject(TYPES.ProductService) private organizationService: OrganizationService,
    ) {}

    @httpGet('/')
    public get(): Promise<IOrganization> {
        // return this.organizationService.get()
        const testOrg: any = {
            name: "Hyzer Shop",
            retailSettings: {
                salesTaxPercentage: 6,
            },
        }
        return new Promise<IOrganization>(resolve => {
            resolve(testOrg)
        })
    }
}
