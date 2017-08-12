import * as express from 'express';
import { Request, Response } from 'express';
import {
  interfaces, controller, request, response, httpGet, httpPost, httpPut, httpDelete, queryParam, requestParam
} from 'inversify-express-utils';
import { injectable, inject } from 'inversify';

import CONSTANTS from '@time/constants';
import { TYPES } from '@time/constants/inversify/types';
import { handleError } from '@time/api-utils';
import { ProductService } from '../services';
import { IProduct } from '@time/interfaces';
import { WoocommerceMigrationService } from '@time/api-services';
import { Authenticate } from '../auth/authenticate';

@controller('/api/v1/products')
@injectable()
export class ProductsController implements interfaces.Controller {

    constructor(
        @inject(TYPES.Authenticate) private auth: Authenticate,
        @inject(TYPES.ProductService) private productService: ProductService,
        @inject(TYPES.WoocommerceMigrationService) private wms: WoocommerceMigrationService,
    ) {}

    @httpGet('/')
    private get(
        @queryParam('query') query: string,
        @queryParam('page') page: number,
        @response() res: Response,
    ): Promise<IProduct[]> {
        query = query ? JSON.parse(query) : {};
        res.setHeader('content-type', 'application/json');
        return this.productService.get(query, page, res);
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
            .catch(err => handleError(err, res));
    }

    @httpDelete('/:id')
    private delete(
        @requestParam("id") id: string,
        @response() res: Response,
    ): void {
        this.productService.deleteOne(id)
            .then(() => res.sendStatus(CONSTANTS.HTTP.SUCCESS_noContent))
            .catch((err) => handleError(err, res));
    }

    @httpGet('/migrate')
    private async migrate(
        @request() req: Request,
        @response() res: Response,
    ): Promise<IProduct> {
        await this.auth.authorizedUser(req, res);
        return this.wms.createProductsFromExportedJSON();
    }
}