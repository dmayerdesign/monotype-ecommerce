import { controller, httpGet, request, response } from 'inversify-express-utils'
import { injectable } from 'inversify'
import { Request, Response } from 'express'

@injectable()
@controller('*')
export class AppController {

  // @httpGet('/')
  // public prerenderClientApp(
  //   @request() req: Request,
  //   @response() res: Response,
  // ): any {
  //   res.render('index', { req, res })
  // }

  @httpGet('*')
  public getClientApp(
    @request() req: Request,
    @response() res: Response,
  ): any {
    // res.sendFile('index.html', { root: 'dist/public' });
    res.render('index', { req, res })
  }

}
