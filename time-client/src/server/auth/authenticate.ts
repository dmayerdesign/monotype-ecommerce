import { injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/interfaces';
import { handleError } from '@dannymayer/time-common/api-utils';
import CONSTANTS from '@dannymayer/time-common/constants';

@injectable()
export class Authenticate {

  /*
   * If the user is logged in, get the user. Else, send an error response
   */
  public static isAuthenticated(req: Request, res: Response, next: NextFunction): void {
    if (req.isAuthenticated() && req.user.emailIsVerified) {
      return next();
    }
    else if (req.isAuthenticated() && !req.user.emailIsVerified) {
      return handleError(CONSTANTS.ERRORS.emailNotVerified, res, null, CONSTANTS.HTTP.CLIENT_ERROR_forbidden);
    }
    res.sendStatus(CONSTANTS.HTTP.CLIENT_ERROR_unauthorized);
    console.log(CONSTANTS.WARNINGS.userNotLoggedIn);
  }

  /*
   * If the user is an admin, get the user. Else, send an error response
   */
  public static isAuthorized(req: Request, res: Response, next: NextFunction): void {
    this.isAuthenticated(req, res, () => {
      if (req.user.adminKey === process.env.ADMIN_KEY) {
        return next();
      }
      else {
        handleError(CONSTANTS.ERRORS.userNotAuthorized, res, null, CONSTANTS.HTTP.CLIENT_ERROR_forbidden);
      }
    });
  }
}