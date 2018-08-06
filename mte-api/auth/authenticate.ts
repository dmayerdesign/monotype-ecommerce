import { NextFunction, Request, Response } from 'express'
import { injectable } from 'inversify'
import * as jwt from 'jsonwebtoken'

import { Cookies, Copy, HttpStatus } from '@mte/common/constants'
import { UserHelper } from '@mte/common/helpers/user.helper'
import { User } from '@mte/common/models/api-models/user'
import { ApiErrorResponse } from '@mte/common/models/api-responses/api-error.response'
import { DbClient } from '../data-access/db-client'

const jwtSecret = process.env.JWT_SECRET

@injectable()
export class Authenticate {

    private static dbClient = new DbClient<User>()

    // If the user is logged in, call `next()`. Else, send an error response.

    public static isAuthenticated(req: Request, res: Response, next: NextFunction): void {
        const token = req.cookies[Cookies.jwt]
        let payload: User = null

        if (!token) {
            res.status(HttpStatus.CLIENT_ERROR_UNAUTHORIZED).send(new ApiErrorResponse(new Error(Copy.ErrorMessages.userNotAuthenticated), HttpStatus.CLIENT_ERROR_UNAUTHORIZED))
            return
        }

        try {
            payload = jwt.verify(token, jwtSecret) as User
        }
        catch (error) {
            res.status(HttpStatus.CLIENT_ERROR_UNAUTHORIZED).json(new ApiErrorResponse(new Error(Copy.ErrorMessages.userNotAuthenticated), HttpStatus.CLIENT_ERROR_UNAUTHORIZED))
            return
        }

        if (payload.email) {
            req.user = UserHelper.cleanUser(payload)
            next()
            return
        }

        Authenticate.dbClient.findById(User, payload._id).then((user) => {
            if (user) {
                req.user = user
                next()
            } else {
                res.status(HttpStatus.CLIENT_ERROR_UNAUTHORIZED).json(new Error(Copy.ErrorMessages.userNotAuthorized))
                return
            }
        })

    }

    // If the user has the specified role, call `next()`. Else, send an error response.

    public static isAuthorized(role: number): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            this.isAuthenticated(req, res, () => {
                if ((req.user as User).role === role) {
                    return next()
                }
                else {
                    res.status(HttpStatus.CLIENT_ERROR_FORBIDDEN).json(new Error(Copy.ErrorMessages.userNotAuthorized))
                }
            })
        }
    }
}
