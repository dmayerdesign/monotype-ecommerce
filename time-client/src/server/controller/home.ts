import { controller, httpGet, request, response } from 'inversify-express-utils';
import { injectable } from 'inversify';
import { Request, Response } from 'express';

@injectable()
@controller('/')
export class HomeController {

  // @httpGet('/')
  // public get(@response() res: Response): any {
  //   res.sendFile('index.html', { root: 'dist/public' });
  // }

}
