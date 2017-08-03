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
    private index(req: express.Request, res: express.Response, next: express.NextFunction): Promise<IProduct[]> {
        return this.productService.get(req.query.id);
    }

    @httpGet('/')
    private list(@queryParam('start') start: number, @queryParam('count') count: number): Promise<IProduct[]> {
        return this.productService.get({});
    }

    @httpGet('/')
    private async create(@response() res: express.Response) {
        try {
            // await this.fooService.create(req.body)
            res.json({ Hello: true });
        } catch (err) {
            res.status(400).json({ error: err.message })
        }
    }

    @httpDelete('/:id')
    private delete(@requestParam("id") id: string, @response() res: express.Response): Promise<any> {
        return this.productService.deleteOne(id)
            .then(() => res.sendStatus(204))
            .catch((err) => {
                res.status(400).json({ error: err.message })
            })
    }
}