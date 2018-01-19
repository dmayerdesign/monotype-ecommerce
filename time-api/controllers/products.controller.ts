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
import { ApiEndpoints, Types } from '@time/common/constants'
import { GetProductsFromIdsRequest, GetProductsRequest } from '@time/common/models/api-requests/get-products.request'
import { ProductService, WoocommerceMigrationService } from '../services'
import { ApiController } from './api.controller'

@injectable()
@controller(ApiEndpoints.Products)
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
}
