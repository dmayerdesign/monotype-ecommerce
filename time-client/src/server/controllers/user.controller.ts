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
import { IUser } from '@time/common/models/interfaces';
import { UserService } from '../services/user.service';
import TYPES from '@time/common/constants/inversify/types';
import CONSTANTS from '@time/common/constants';
import { handleError } from '@time/common/api-utils';

@injectable()
@controller('/api/user')
export class UserController {

  constructor(
    @inject(TYPES.UserService) private userService: UserService,
  ) { }

  @httpGet('/', TYPES.isAuthenticated)
  public async getUser(req: Request, res: Response): Promise<IUser> {
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

  @httpPut('/update', TYPES.isAuthenticated)
  public async updateUser(req: Request, res: Response): Promise<IUser> {
    return this.userService.updateUser(req.user._id, req.body);
  }

  @httpDelete('/:id')
  public deleteUser(req: Request): Promise<any> {
    return this.userService.deleteUser(req.params.id);
  }
}
