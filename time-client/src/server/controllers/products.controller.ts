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

import { appConfig } from '@time/app-config'
import { handleError } from '@time/common/api-utils'
import CONSTANTS, { TYPES } from '@time/common/constants'
import { IProduct } from '@time/common/models/interfaces'
import { ProductService } from '../services'
import { WoocommerceMigrationService } from '../services'

@injectable()
@controller('/api/products')
export class ProductsController implements interfaces.Controller {

    constructor(
        @inject(TYPES.ProductService) private productService: ProductService,
        @inject(TYPES.WoocommerceMigrationService) private wms: WoocommerceMigrationService,
    ) {}

    @httpGet('/', TYPES.isAuthenticated)
    private get(
        @queryParam('query') query: string,
        @queryParam('page') page: number,
        @response() res: Response,
    ): Promise<IProduct[]> {
        const test = true
        if (test) {
            return new Promise(resolve => resolve([]))
        }
        query = query ? JSON.parse(query) : {}
        res.setHeader('content-type', 'application/json')
        return this.productService.get(query, page, res)
    }

    @httpGet('/update-test')
    private updateTest(
        @response() res: Response,
    ): void {
        this.productService.updateTestProduct({
                isStandalone: true,
                SKU: "FFFFFFFF",
            })
            .then(data => res.json(data))
            .catch(err => handleError(err, res))
    }

    @httpDelete('/:id')
    private delete(
        @requestParam("id") id: string,
        @response() res: Response,
    ): void {
        this.productService.deleteOne(id)
            .then(() => res.sendStatus(CONSTANTS.HTTP.SUCCESS_noContent))
            .catch((err) => handleError(err, res))
    }

    @httpGet('/migrate', TYPES.isAuthorized)
    private async migrate(
        @request() req: Request,
        @response() res: Response,
    ): Promise<IProduct> {
        return this.wms.createProductsFromExportedJSON(appConfig)
    }
}
