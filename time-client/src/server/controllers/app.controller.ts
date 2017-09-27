import { Request, Response } from 'express'
import { injectable } from 'inversify'
import { controller, httpGet, request, response } from 'inversify-express-utils'

@injectable()
@controller('*')
export class AppController {

  @httpGet('*')
  public getClientApp(
    @request() req: Request,
    @response() res: Response,
  ): any {
    res.sendFile('index.html', { root: 'dist/public' })
    // res.render('index', { req, res })
  }

}
