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
import { HttpStatus, Types } from '@time/common/constants'
import { IProduct, IServiceResponse } from '@time/common/models/interfaces'
import { ProductService } from '../services'
import { WoocommerceMigrationService } from '../services'

@injectable()
@controller('/api/products')
export class ProductsController implements interfaces.Controller {

    constructor(
        @inject(Types.ProductService) private productService: ProductService,
        @inject(Types.WoocommerceMigrationService) private wms: WoocommerceMigrationService,
    ) {}

    @httpGet('/', Types.isAuthenticated)
    private get(
        @queryParam('query') query: string,
        @queryParam('page') page: number,
        @response() res: Response,
    ): Promise<IServiceResponse<IProduct[]>>|void {
        const test = true
        let parsedQuery: object
        if (test) {
            res.json([])
            return
        }
        parsedQuery = query ? JSON.parse(query) : {}
        res.setHeader('content-type', 'application/json')
        return this.productService.get(parsedQuery, page, res)
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
            .catch(err => res.status(500).json(err))
    }

    @httpDelete('/:id')
    private delete(
        @requestParam("id") id: string,
        @response() res: Response,
    ): void {
        this.productService.deleteOne(id)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({data, status}) => res.status(status).json(data))
    }

    @httpGet('/migrate', Types.isAuthorized)
    private async migrate(
        @request() req: Request,
        @response() res: Response,
    ): Promise<IProduct> {
        return this.wms.createProductsFromExportedJSON(appConfig)
    }
}
