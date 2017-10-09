import * as express from 'express'
import { Request, Response } from 'express'
import { inject, injectable, Container } from 'inversify'
import {
    controller,
    httpDelete,
    httpGet,
    httpPost,
    httpPut,
    request,
    response,
} from 'inversify-express-utils'

import { handleError } from '@time/common/api-utils'
import CONSTANTS from '@time/common/constants'
import TYPES from '@time/common/constants/inversify/types'
import { UserService } from '../services/user.service'

@injectable()
@controller('/api/user')
export class UserController {

    constructor(
        @inject(TYPES.UserService) private userService: UserService,
    ) { }

    @httpGet('/login')
    public login(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.userService.login(req.body)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({error, status}) => res.status(status).json(error))
    }

    @httpPost('/register')
    public createUser(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.userService.register(req.body)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({error, status}) => res.status(status).json(error))
    }

    @httpPut('/update', TYPES.isAuthenticated)
    public updateUser(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.userService.updateUser(req.user._id, req.body)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({error, status}) => res.status(status).json(error))
    }

    @httpDelete('/:id')
    public deleteUser(
        @request() req: Request,
        @response() res: Response,
    ): void {
        this.userService.deleteUser(req.params.id)
            .then(({data, status}) => res.status(status).json(data))
            .catch(({error, status}) => res.status(status).json(error))
    }
}
