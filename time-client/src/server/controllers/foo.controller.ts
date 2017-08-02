import * as express from 'express';
import {
  interfaces, controller, request, response, httpGet, httpPost, httpPut, httpDelete
} from 'inversify-express-utils';
import { injectable, inject } from 'inversify';

@controller('/foo')
@injectable()
export class FooController implements interfaces.Controller {

    constructor( /*@inject('FooService') private fooService: FooService*/ ) {}

    // @httpGet('/')
    // private index(req: express.Request, res: express.Response, next: express.NextFunction): string {
    //     return this.fooService.get(req.query.id);
    // }

    // @httpGet('/')
    // private list(@queryParams('start') start: number, @queryParams('count') cound: number): string {
    //     return this.fooService.get(start, count);
    // }

    @httpGet('/')
    private async create(@response() res: express.Response) {
        try {
            // await this.fooService.create(req.body)
            res.json({ Hello: true });
        } catch (err) {
            res.status(400).json({ error: err.message })
        }
    }

    // @httpDelete('/:id')
    // private delete(@requestParam("id") id: string, @response() res: express.Response): Promise<void> {
    //     return this.fooService.delete(id)
    //         .then(() => res.sendStatus(204))
    //         .catch((err) => {
    //             res.status(400).json({ error: err.message })
    //         })
    // }
}