import { Request, Response } from 'express'
import { injectable } from 'inversify'
import { controller, httpGet, next, request, response } from 'inversify-express-utils'

@injectable()
@controller('*')
export class AppController {

  @httpGet('*')
  public getClientApp(
    @request() req: Request,
    @response() res: Response,
    @next() next: any,
  ): void {
    // res.sendFile('index.html', { root: 'dist/public' })
    // ANGULAR UNIVERSAL
    if (req.url.indexOf('/api/') > -1) {
      next()
      return
    }
    res.render('index', { req, res })
  }

}
