import {
  controller,
  httpGet,
  httpPost,
  httpPut,
  httpDelete,
} from 'inversify-express-utils';
import { injectable, inject, Container } from 'inversify';
import * as express from 'express';
import { Request, Response } from 'express';
import { IUser } from '../models/interfaces/user';
import { UserService } from '../services/user.service';
import TYPES from '@time/constants/inversify/types';
import CONSTANTS from '@time/constants';
import { Authenticate } from '../auth/authenticate';
import { handleError } from '@time/api-utils';

@injectable()
@controller('/api/v1/user')
export class UserController {

  constructor(
    @inject(TYPES.Authenticate) private auth: Authenticate,
    @inject(TYPES.UserService) private userService: UserService,
  ) { }

  @httpGet('/')
  public async getUser(req: Request, res: Response): Promise<IUser> {
    const user = await this.auth.authenticatedUser(req, res);
    return this.userService.getUser(req.user._id);
  }

  @httpPost('/register')
  public createUser(req: Request): Promise<IUser> {
    return this.userService.register(req.body);
  }

  @httpGet('/is-logged-in')
  public checkLogin(req: Request, res: Response): Promise<any> {
    return this.userService.isUserLoggedIn(req);
  }

  @httpPut('/update')
  public async updateUser(req: Request, res: Response): Promise<IUser> {
    const user = await this.auth.authenticatedUser(req, res);
    return this.userService.updateUser(user._id, req.body);
  }

  @httpDelete('/:id')
  public deleteUser(req: Request): Promise<any> {
    return this.userService.deleteUser(req.params.id);
  }
}
