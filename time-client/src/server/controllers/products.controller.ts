import * as express from 'express';
import {
  interfaces, controller, request, response, httpGet, httpPost, httpPut, httpDelete, queryParam, requestParam
} from 'inversify-express-utils';
import { injectable, inject } from 'inversify';

import { TYPES } from '../constants/inversify/types';
import { ProductService } from '../services/product.service';
import { IProduct } from '../../../../time-common/models/interfaces';

@controller('/api/v1/products')
@injectable()
export class ProductsController implements interfaces.Controller {

    constructor( @inject(TYPES.ProductService) private productService: ProductService ) {}

    @httpGet('/')
    private get(
        @queryParam('query') query: any,
        @queryParam('page') page: number,
    ): void {
        this.productService.get(query, page);
    }

    @httpGet('/test')
    private test(
        @response() res: express.Response,
    ): void {
        this.productService.test()
            .then(data => res.status(201).json(data))
            .catch(data => res.status(400).json({error: true}))
    }

    @httpDelete('/:id')
    private delete(
        @requestParam("id") id: string,
        @response() res: express.Response,
    ): void {
        this.productService.deleteOne(id)
            .then(() => res.sendStatus(204))
            .catch((err) => {
                res.status(400).json({ error: err.message })
            })
    }
}