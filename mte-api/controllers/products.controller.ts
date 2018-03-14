import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import {
    controller,
    httpGet,
    interfaces,
    queryParam,
    request,
    requestParam,
    response,
} from 'inversify-express-utils'

import { AppConfig } from '@mte/app-config'
import { ApiEndpoints, Types } from '@mte/common/constants'
import { GetProductsFromIdsRequest, GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { ProductService } from '../services/product.service'
import { WoocommerceMigrationService } from '../services/woocommerce-migration.service'
import { ApiController } from './api.controller'

@injectable()
@controller(ApiEndpoints.Products)
export class ProductsController extends ApiController implements interfaces.Controller {

    constructor(
        @inject(Types.ProductService) private productService: ProductService,
        @inject(Types.WoocommerceMigrationService) private wms: WoocommerceMigrationService,
    ) { super() }

    @httpGet('/')
    public get(
        @queryParam('request') request: string,
        @request() req: Request,
        @response() res: Response,
    ): void {
        const parsedQuery: GetProductsRequest | GetProductsFromIdsRequest = request
            ? JSON.parse(request)
            : new GetProductsRequest()

        if ((parsedQuery as GetProductsFromIdsRequest).ids) {
            // Get a list of products from the requested `id`s.
            this.handleApiResponse(this.productService.getIds(new GetProductsFromIdsRequest((parsedQuery as GetProductsFromIdsRequest))), res)
        }
        else {
            // Pipe a stream of products into the response.
            this.productService.getProducts(new GetProductsRequest(parsedQuery as GetProductsRequest), res)
        }
    }

    /**
     * Get a single product.
     *
     * @param {string} slug
     * @param {Response} res
     * @memberof ProductsController
     */
    @httpGet('/:slug')
    public getOne(
        @requestParam('slug') slug: string,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.productService.getOneSlug(slug), res)
    }

    /**
     * Get the product along with any variations.
     *
     * @param {string} slug
     * @param {Response} res
     * @memberof ProductsController
     */
    @httpGet('/:slug/detail')
    public getDetail(
        @requestParam('slug') slug: string,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.productService.getDetail(slug), res)
    }
}
