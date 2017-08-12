import { injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/interfaces';
import { handleError } from '@time/api-utils';
import CONSTANTS from '@time/constants';

@injectable()
export class Authenticate {

  /*
   * If the user is logged in, get the user. Else, send an error response
   */
  public authenticatedUser(req: Request, res: Response): Promise<IUser> {
    return new Promise<IUser>((resolve, reject) => {
      if (req.isAuthenticated() && req.user.emailIsVerified) {
        return resolve(req.user);
      }
      else if (req.isAuthenticated() && !req.user.emailIsVerified) {
        handleError(CONSTANTS.ERRORS.emailNotVerified, res, null, CONSTANTS.HTTP.CLIENT_ERROR_forbidden);
        return reject();
      }
      res.sendStatus(CONSTANTS.HTTP.CLIENT_ERROR_unauthorized);
      console.log(CONSTANTS.WARNINGS.userNotLoggedIn);
      reject();
    });
  }

  /*
   * If the user is an admin, get the user. Else, send an error response
   */
  public authorizedUser(req: Request, res: Response): Promise<IUser> {
    return new Promise<IUser>((resolve, reject) => {
      this.authenticatedUser(req, res).then(() => {
        if (req.user.adminKey === process.env.ADMIN_KEY) {
          return resolve(req.user);
        }
        else {
          handleError(CONSTANTS.ERRORS.userNotAuthorized, res, null, CONSTANTS.HTTP.CLIENT_ERROR_forbidden);
          reject();
        }
      });
    });
  }

  /*
   * Check if the user is an admin
   */
  public isAuthorized(req: Request, res: Response, next: NextFunction): any {
    this.authenticatedUser(req, res).then(() => {
      if (req.user.adminKey === process.env.ADMIN_KEY) {
        return next();
      }
      else {
        handleError(CONSTANTS.ERRORS.userNotAuthorized, res, null, CONSTANTS.HTTP.CLIENT_ERROR_forbidden);
      }
    });
  }
}