import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import * as jwt from 'jsonwebtoken'

import { Cookies, Copy, HttpStatus } from '@time/common/constants'
import { ErrorMessage } from '@time/common/constants/error-message'
import { Types } from '@time/common/constants/inversify'
import { User, UserModel } from '@time/common/models/api-models/user'
import { ApiErrorResponse } from '@time/common/models/helpers/api-error-response'
import { DbClient } from '../data-access/db-client'
import { UserService } from '../services/user.service'

const jwtSecret = process.env.JWT_SECRET

@injectable()
export class Authenticate {

    private static dbClient = new DbClient<User>()
    private static userService = new UserService()

    // If the user is logged in, call `next()`. Else, send an error response

    public static isAuthenticated(req: Request, res: Response, next: NextFunction) {
        const token = req.cookies[Cookies.jwt]
        let payload: User = null

        if (!token) {
            res.status(HttpStatus.CLIENT_ERROR_unauthorized).send(new ApiErrorResponse(new Error(ErrorMessage.UserNotAuthenticated), HttpStatus.CLIENT_ERROR_unauthorized))
            return
        }

        try {
            payload = jwt.verify(token, jwtSecret) as User
        }
        catch (error) {
            res.status(HttpStatus.CLIENT_ERROR_unauthorized).json(new ApiErrorResponse(new Error(Copy.ErrorMessages.generic), HttpStatus.CLIENT_ERROR_unauthorized))
            return
        }

        if (payload.email) {
            req.user = Authenticate.userService.cleanUser(payload)
            next()
        }

        Authenticate.dbClient.findById(UserModel, payload._id).then((user) => {
            if (user) {
                req.user = user
                next()
            } else {
                res.status(HttpStatus.CLIENT_ERROR_unauthorized).json(new Error(Copy.ErrorMessages.userNotAuthorized))
                return
            }
        })

    }

    // If the user has the specified role, call `next()`. Else, send an error response

    public static isAuthorized(role: number) {
        return (req: Request, res: Response, next: NextFunction) => {
            this.isAuthenticated(req, res, () => {

            // if ((<User>req.user).role === role) {
                return next()
            // }
            // else {
            //   res.status(403).json({})
            // }

            })
        }
    }
}
