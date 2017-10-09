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
import { Observable } from 'rxjs/Observable'

import { appConfig } from '@time/app-config'
import CONSTANTS, { TYPES } from '@time/common/constants'
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

    @httpGet('/', TYPES.isAuthorized)
    public getSettings(@response() res: Response) {
        return Observable.of({ secret: true })
    }
}
