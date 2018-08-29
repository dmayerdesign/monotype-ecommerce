import { GetProductsFromIdsRequest, GetProductsRequest } from '@mte/common/api/requests/get-products.request'
import { ApiEndpoints, Types } from '@mte/common/constants'
import { Response } from 'express'
import { inject, injectable } from 'inversify'
import {
    controller,
    httpGet,
    interfaces,
    queryParam,
    requestParam,
    response,
} from 'inversify-express-utils'
import { ProductService } from '../services/product.service'
import { ApiController } from './api.controller'

@injectable()
@controller(ApiEndpoints.Products)
export class ProductsController extends ApiController implements interfaces.Controller {

    constructor(
        @inject(Types.ProductService) private productService: ProductService,
    ) { super() }

    @httpGet('/')
    public get(
        @queryParam('request') request: string,
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

    @httpGet('/price-range')
    public getPriceRange(
        @queryParam('request') request: string,
        @response() res: Response,
    ): void {
        const parsedQuery: GetProductsRequest = request
            ? JSON.parse(request)
            : new GetProductsRequest()
        this.handleApiResponse(this.productService.getPriceRange(
            new GetProductsRequest(parsedQuery as GetProductsRequest)
        ), res)
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
        this.handleApiResponse(this.productService.getProductDetail(slug), res)
    }
}
