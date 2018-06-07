import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import {
    controller,
    httpDelete,
    httpGet,
    httpPost,
    httpPut,
    request,
    requestParam,
    response,
} from 'inversify-express-utils'

import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { Types } from '@mte/common/constants/inversify/types'
import { UserService } from '../services/user.service'
import { ApiController } from './api.controller'

@injectable()
@controller(ApiEndpoints.User)
export class UserController extends ApiController {

    @inject(Types.UserService) private userService: UserService

    @httpGet('/', Types.isAuthenticated)
    public getUser(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.userService.refreshSession(req, res)
    }

    @httpPost('/login')
    public login(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.userService.login(req.body, res)
            .catch(({message, status}) => res.status(status).json({message, status}))
    }

    @httpPost('/verify-email/:token')
    public verifyEmail(
        @requestParam('token') token: string,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.userService.verifyEmail(token), res)
    }

    @httpPost('/logout')
    public logout(
        @response() res: Response,
    ): void {
        this.userService.logout(res)
    }

    @httpPost('/register')
    public createUser(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.userService.register(req.body, res)
            .catch(({message, status}) => res.status(status).json({message, status}))
    }

    @httpPut('/update', Types.isAuthenticated)
    public updateUser(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.userService.updateUser(req.user._id, req.body), res)
    }

    @httpDelete('/:id', Types.isOwner)
    public deleteUser(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.userService.deleteUser(req.params.id), res)
    }
}
