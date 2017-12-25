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

import { Endpoints } from '@time/common/constants/endpoints'
import { Types } from '@time/common/constants/inversify/types'
import { UserService } from '../services/user.service'

@injectable()
@controller(Endpoints.User)
export class UserController {

    constructor(
        @inject(Types.UserService) private userService: UserService,
    ) { }

    @httpPost('/login')
    public login(
        @request() req: Request,
        @response() res: Response,
    ) {
        this.userService.login(req.body, res)
            .catch(({message, status}) => res.status(status).json({message, status}))
    }

    @httpPost('/verify-email/:token')
    public verifyEmail(
        @requestParam('token') token: string,
        @response() res: Response,
    ) {
        this.userService.verifyEmail(token)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({message, status}) => res.status(status).json({message, status}))
    }

    @httpPost('/logout')
    public logout(
        @response() res: Response,
    ) {
        this.userService.logout(res)
    }

    @httpGet('/get-user', Types.isAuthenticated)
    public getUser(
        @request() req: Request,
        @response() res: Response,
    ) {
        this.userService.refreshSession(req, res)
    }

    @httpPost('/register')
    public createUser(
        @request() req: Request,
        @response() res: Response,
    ) {
        this.userService.register(req.body, res)
            .catch(({message, status}) => res.status(status).json({message, status}))
    }

    @httpPut('/update', Types.isAuthenticated)
    public updateUser(
        @request() req: Request,
        @response() res: Response,
    ) {
        this.userService.updateUser(req.user._id, req.body)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({message, status}) => res.status(status).json({message, status}))
    }

    @httpDelete('/:id', Types.isAuthorized)
    public deleteUser(
        @request() req: Request,
        @response() res: Response,
    ) {
        this.userService.deleteUser(req.params.id)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({message, status}) => res.status(status).json({message, status}))
    }
}
