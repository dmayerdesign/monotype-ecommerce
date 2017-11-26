import { NextFunction, Request, Response } from 'express'
import { injectable } from 'inversify'
import * as jwt from 'jsonwebtoken'

import { HttpStatus } from '@time/common/constants'
import { Cookies, Copy } from '@time/common/constants'
import { ErrorMessage } from '@time/common/constants/error-message'
import { User } from '@time/common/models/api-models/user'
import { ApiErrorResponse } from '@time/common/models/helpers/api-error-response'

const jwtSecret = process.env.JWT_SECRET

@injectable()
export class Authenticate {

    /*
     * If the user is logged in, call `next()`. Else, send an error response
     */
    public static isAuthenticated(req: Request, res: Response, next: NextFunction): void {
        const token = req.cookies[Cookies.jwt]
        let payload: User = null

        if (!token) {
            res.status(HttpStatus.CLIENT_ERROR_unauthorized).json(new ApiErrorResponse(new Error(ErrorMessage.UserNotAuthenticated)))
            return
        }

        try {
            payload = jwt.verify(token, jwtSecret)
        }
        catch (error) {
            res.status(HttpStatus.CLIENT_ERROR_unauthorized).json(new ApiErrorResponse(new Error(Copy.ErrorMessages.generic)))
            return
        }

        console.log("Payload:", payload)
        if (payload.email) {
            req.user = payload
            next()
        }
        /*
        User.findById(payload._id).then((user) => {
            if (user) {
                req.user = user
                next()
            } else {
                res.status(HttpStatus.CLIENT_ERROR_unauthorized).json(new Error(Copy.ErrorMessages.genericErrorMessage))
                return
            }
        })
        */
    }

    /*
     * If the user has the specified role, call `next()`. Else, send an error response
     */
    public static isAuthorized(role: number) {
        return (req: Request, res: Response, next: NextFunction): void => {
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
