import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import {
    controller,
    httpDelete,
    httpGet,
    interfaces,
    queryParam,
    request,
    requestParam,
    response,
} from 'inversify-express-utils'

import { AppConfig } from '@time/app-config'
import { Endpoints, Types } from '@time/common/constants'
import { Product } from '@time/common/models/api-models/product'
import { GetProductsRequest } from '@time/common/models/api-requests/get-products.request'
import { ProductService, WoocommerceMigrationService } from '../services'

@injectable()
@controller(Endpoints.Products)
export class ProductsController implements interfaces.Controller {

    constructor(
        @inject(Types.ProductService) private productService: ProductService,
        @inject(Types.WoocommerceMigrationService) private wms: WoocommerceMigrationService,
    ) {}

    @httpGet('/')
    public get(
        @queryParam('query') query: string,
        @response() res: Response,
    ) {
        const parsedQuery = query ? <GetProductsRequest>JSON.parse(query) : {}

        if (parsedQuery.ids) {
            this.productService.getSome(parsedQuery.ids)
                .then(({data, status}) => res.status(status).json(data))
                .catch(({data, status}) => res.status(status).json(data))
        }
        else {
            res.setHeader('content-type', 'application/json')
            return this.productService.get(parsedQuery, res)
        }
    }

    @httpGet('/:slug')
    public getOne(
        @requestParam('slug') slug: string,
        @response() res: Response,
    ): void {
        this.productService.getOne(slug)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({data, status}) => res.status(status).json(data))
    }

    @httpGet('/update-test')
    public updateTest(
        @response() res: Response,
    ): void {
        this.productService.updateTestProduct({
                isStandalone: true,
                SKU: "TEST_001",
            })
            .then(data => res.json(data))
            .catch(err => res.status(500).json(err))
    }

    @httpDelete('/:id')
    public delete(
        @requestParam("id") id: string,
        @response() res: Response,
    ): void {
        this.productService.deleteOne(id)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({data, status}) => res.status(status).json(data))
    }

    @httpGet('/migrate'/*, Types.isAuthorized*/)
    public async migrate(
        @request() req: Request,
        @response() res: Response,
    ): Promise<Product> {
        return this.wms.createProductsFromExportedJSON(AppConfig)
    }
}
