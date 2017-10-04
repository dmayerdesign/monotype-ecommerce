import { handleError } from '@time/common/api-utils'
import CONSTANTS from '@time/common/constants'
import TYPES from '@time/common/constants/inversify/types'
import { IUser } from '@time/common/models/interfaces'
import * as express from 'express'
import { Request, Response } from 'express'
import { inject, injectable, Container } from 'inversify'
import {
  controller,
  httpDelete,
  httpGet,
  httpPost,
  httpPut,
} from 'inversify-express-utils'
import { IAuthResponse } from '../../../../time-common/models/interfaces/user'
import { UserService } from '../services/user.service'

@injectable()
@controller('/api/user')
export class UserController {

  constructor(
    @inject(TYPES.UserService) private userService: UserService,
  ) { }

  @httpGet('/login')
  public login(req: Request): Promise<IAuthResponse> {
    return this.userService.login(req.body)
  }

  @httpPost('/register')
  public createUser(req: Request): Promise<IAuthResponse> {
    return this.userService.register(req.body)
  }

  @httpPut('/update', TYPES.isAuthenticated)
  public async updateUser(req: Request, res: Response): Promise<IUser> {
    return this.userService.updateUser(req.user._id, req.body)
  }

  @httpDelete('/:id')
  public deleteUser(req: Request): Promise<any> {
    return this.userService.deleteUser(req.params.id)
  }
}
