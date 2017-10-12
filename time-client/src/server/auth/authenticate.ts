import { NextFunction, Request, Response } from 'express'
import { injectable } from 'inversify'
import * as jwt from 'jsonwebtoken'

import { AuthConfig } from '@time/common/config/auth.config'
import { HttpStatus } from '@time/common/constants'
import { Constants } from '@time/common/constants'
import { IUser } from '@time/common/models'

const jwtSecret = process.env.JWT_SECRET

@injectable()
export class Authenticate {

    /*
     * If the user is logged in, call `next()`. Else, send an error response
     */
    public static isAuthenticated(req: Request, res: Response, next: NextFunction): void {
        const token = req.cookies[Constants.Cookies.jwtToken]
        let payload: IUser = null

        if (!token) {
            res.status(HttpStatus.CLIENT_ERROR_unauthorized).json({})
            return
        }

        try {
            payload = jwt.verify(token, jwtSecret)
        }
        catch (error) {
            res.status(HttpStatus.CLIENT_ERROR_unauthorized).json(new Error(Constants.Errors.genericErrorMessage))
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
                res.status(HttpStatus.CLIENT_ERROR_unauthorized).json(new Error(Constants.Errors.genericErrorMessage))
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

            // if ((<IUser>req.user).role === role) {
                return next()
            // }
            // else {
            //   res.status(403).json({})
            // }

            })
        }
    }
}
