import {
  controller, httpGet, httpPost, httpPut, httpDelete
} from 'inversify-express-utils';
import { injectable, inject } from 'inversify';
import { Request } from 'express';
import { IUser } from '../../../../time-common/models/interfaces/user';
import { UserService } from '../services/user.service';
import TYPES from '../constants/inversify/types';

@injectable()
@controller('/user')
export class UserController {

  constructor( @inject(TYPES.UserService) private userService: UserService) { }

  @httpGet('/')
  public getUser(request: Request): Promise<IUser> {
    return this.userService.getUser(request.params.id);
  }

  @httpPost('/')
  public newUser(request: Request): Promise<IUser> {
    return this.userService.newUser(request.body);
  }

  @httpPut('/:id')
  public updateUser(request: Request): Promise<IUser> {
    return this.userService.updateUser(request.params.id, request.body);
  }

  @httpDelete('/:id')
  public deleteUser(request: Request): Promise<any> {
    return this.userService.deleteUser(request.params.id);
  }
}
