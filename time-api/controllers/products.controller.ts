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
import { GetProductsFromIdsRequest, GetProductsRequest } from '@time/common/models/api-requests/get-products.request'
import { ApiResponse } from '@time/common/models/api-responses/api.response'
import { ProductService, WoocommerceMigrationService } from '../services'
import { ApiController } from './api.controller'


@injectable()
@controller(Endpoints.Products)
export class ProductsController extends ApiController implements interfaces.Controller {

    @inject(Types.ProductService) private productService: ProductService
    @inject(Types.WoocommerceMigrationService) private wms: WoocommerceMigrationService

    @httpGet('/')
    public get(
        @queryParam('request') request: string,
        @response() res: Response,
    ): void {
        const parsedQuery: GetProductsRequest | GetProductsFromIdsRequest = request ? <GetProductsRequest | GetProductsFromIdsRequest>JSON.parse(request) : null

        if ((parsedQuery as GetProductsFromIdsRequest).ids) {
            this.handleApiResponse(this.productService.getIds(new GetProductsFromIdsRequest((parsedQuery as GetProductsFromIdsRequest))), res)
        }
        else {
            this.productService.getProducts(new GetProductsRequest(parsedQuery as GetProductsRequest), res)
        }
    }

    @httpGet('/:slug')
    public getOne(
        @requestParam('slug') slug: string,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.productService.getOneSlug(slug), res)
    }

    @httpGet('/id/:id')
    public getOneById(
        @requestParam('id') id: string,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.productService.getOne(id), res)
    }

    @httpGet('/update-test')
    public updateTest(
        @response() res: Response,
    ): void {
        this.productService.updateTestProduct({
                isStandalone: true,
                sku: 'TEST_001',
            })
            .then(data => res.json(data))
            .catch(err => res.status(500).json(err))
    }

    @httpDelete('/:id')
    public delete(
        @requestParam('id') id: string,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.productService.deleteOne(id), res)
    }

    @httpGet('/migrate'/*, Types.isAuthorized*/)
    public async migrate(
        @request() req: Request,
        @response() res: Response,
    ): Promise<Product> {
        return this.wms.createProductsFromExportedJSON(AppConfig)
    }
}
