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

import { Types } from '@time/common/constants/inversify/types'
import { UserService } from '../services/user.service'

@injectable()
@controller('/api/user')
export class UserController {

    constructor(
        @inject(Types.UserService) private userService: UserService,
    ) { }

    // @httpPost('/login')
    /* FOR TESTING */
    @httpGet('/login')
    public login(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.userService.login(req.body, res)
            .catch(({error, status}) => res.status(status).json(error))
    }

    @httpPost('/verify-email/:token')
    public verifyEmail(
        @requestParam('token') token: string,
        @response() res: Response,
    ): void {
        this.userService.verifyEmail(token)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({error, status}) => res.status(status).json(error))
    }

    @httpPost('/logout')
    public logout(
        @response() res: Response,
    ): void {
        this.userService.logout(res)
    }

    @httpGet('/get-user', Types.isAuthenticated)
    public getUser(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.userService.refreshSession(req, res)
    }

    @httpPost('/register')
    public createUser(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.userService.register(req.body, res)
            .catch(({error, status}) => res.status(status).json(error))
    }

    @httpPut('/update', Types.isAuthenticated)
    public updateUser(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.userService.updateUser(req.user._id, req.body)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({error, status}) => res.status(status).json(error))
    }

    @httpDelete('/:id', Types.isAuthorized)
    public deleteUser(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.userService.deleteUser(req.params.id)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({error, status}) => res.status(status).json(error))
    }
}
