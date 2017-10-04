import { handleError } from '@time/common/api-utils'
import { CONSTANTS } from '@time/common/constants'
import { IUser } from '@time/common/models'
import { NextFunction, Request, Response } from 'express'
import { injectable } from 'inversify'
import * as passport from 'passport'

@injectable()
export class Authenticate {

  /*
   * If the user is logged in, call `next()`. Else, send an error response
   */
  public static isAuthenticated(req: Request, res: Response, next: NextFunction): void {
    console.log(req.headers)
    passport.authenticate('jwt', { session: false })(req, res, next)
  }

  /*
   * If the user has the specified role, call `next()`. Else, send an error response
   */
  public static isAuthorized(role: number) {
    return (req: Request, res: Response, next: NextFunction): void => {
      this.isAuthenticated(req, res, () => {

        // if ((<IUser>req.user).role === role) {
          return next()
        // }
        // else {
        //   handleError(CONSTANTS.ERRORS.userNotAuthorized, res, null, CONSTANTS.HTTP.CLIENT_ERROR_forbidden)
        // }

      })
    }
  }
}
