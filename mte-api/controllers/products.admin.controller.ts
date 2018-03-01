import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import {
    controller,
    httpDelete,
    httpGet,
    httpPost,
    interfaces,
    request,
    requestParam,
    response,
} from 'inversify-express-utils'

import { ApiEndpoints, Types } from '@mte/common/constants'
import { Product } from '@mte/common/models/api-models/product'
import { GetProductsFromIdsRequest, GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { ProductService, WoocommerceMigrationService } from '../services'
import { ApiController } from './api.controller'

@injectable()
@controller(ApiEndpoints.ProductsAdmin/*, Types.isOwner*/)
export class ProductsAdminController extends ApiController implements interfaces.Controller {

    @inject(Types.ProductService) private productService: ProductService
    @inject(Types.WoocommerceMigrationService) private wms: WoocommerceMigrationService

    @httpGet('/get-by-slug/:slug')
    public getOneBySlug(
        @requestParam('slug') slug: string,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.productService.getOneSlug(slug), res)
    }

    @httpGet('/get-by-id/:id')
    public getOneById(
        @requestParam('id') id: string,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.productService.getOne(id), res)
    }

    @httpDelete('/:id')
    public delete(
        @requestParam('id') id: string,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.productService.deleteOne(id), res)
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

    @httpPost('/migrate')
    public migrateProducts(
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.wms.createProductsFromExportedJSON(), res)
    }
}
