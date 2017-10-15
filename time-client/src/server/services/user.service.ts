import * as bcrypt from 'bcrypt-nodejs'
import { Request, Response } from 'express'
import { injectable } from 'inversify'
import * as jwt from 'jsonwebtoken'

import { AuthConfig } from '@time/common/config/auth.config'
import { Cookies, Copy, HttpStatus } from '@time/common/constants'
import Types from '@time/common/constants/inversify/types'
import { ILogin, IUser, User } from '@time/common/models'
import { ServiceErrorResponse, ServiceResponse } from '@time/common/models/helpers'

@injectable()
export class UserService {

    private jwtSecret = process.env.JWT_SECRET

    public register(user: IUser, res: Response): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            const plainTextPassword = user.password
            let salt, hash
            delete user.password

            // Hash password
            try {
                salt = bcrypt.genSaltSync(12)
                hash = bcrypt.hashSync(plainTextPassword, salt)
            }
            catch (error) {
                reject(new ServiceErrorResponse(error, HttpStatus.CLIENT_ERROR_badRequest))
            }

            // Check for existing user
            User
                .findOne({
                    email: user.email
                })
                .then(existingUser => {
                    if (!existingUser) {
                        const newUser = new User({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            password: hash,
                        })

                        newUser.save().then((savedUser) => {
                            const payload = this.cleanUser(savedUser)
                            const authToken = jwt.sign(payload, this.jwtSecret, AuthConfig.JwtOptions)
                            res.cookie(Cookies.jwt, authToken, AuthConfig.CookieOptions).json(payload)
                            resolve()
                        })
                        .catch((error) => reject(new ServiceErrorResponse(error, HttpStatus.CLIENT_ERROR_badRequest)))
                    }
                    else {
                        reject(new ServiceErrorResponse(
                            new Error(Copy.ErrorMessages.userEmailExists),
                            HttpStatus.CLIENT_ERROR_badRequest,
                        ))
                    }
                }).catch((error) => reject(new ServiceErrorResponse(error, HttpStatus.CLIENT_ERROR_badRequest)))
        })
    }

    public login(credentials: ILogin, res: Response): Promise<null> {
        return new Promise<null>((resolve, reject) => {

            /////////////////////////
            // FOR TESTING
            /////////////////////////
            const fakeUser = {
                email: "test@example.com",
                firstName: "Test",
                lastName: "User",
            }

            try {
                const authToken = jwt.sign(fakeUser, this.jwtSecret, AuthConfig.JwtOptions)
                res.cookie(Cookies.jwt, authToken, AuthConfig.CookieOptions).json(fakeUser)
                resolve()
            }
            catch (error) {
                reject(new ServiceErrorResponse(error, HttpStatus.CLIENT_ERROR_badRequest))
            }

            /*
            return User
                .findOne({
                    email: credentials.email
                })
                .then(user => {
                    try {
                        const authenticated: boolean = bcrypt.compareSync(credentials.password, user.password)
                        if (authenticated) {
                            const payload = this.cleanUser(user)
                            const authToken = jwt.sign(payload, this.jwtSecret, AuthConfig.JwtOptions)
                            res.cookie(Cookies.jwt, authToken, AuthConfig.CookieOptions).json(payload)
                            resolve()
                        } else {
                            return reject(new ServiceErrorResponse(new Error(Copy.ErrorMessages.invalidPassword), 401))
                        }
                    }
                    catch (error) {
                        reject(new ServiceErrorResponse(error, HttpStatus.CLIENT_ERROR_badRequest))
                    }
                })
                .catch((error) => reject(new ServiceErrorResponse(error, HttpStatus.CLIENT_ERROR_badRequest)))
            */
        })
    }

    public logout(res: Response): void {
        res.clearCookie(Cookies.jwt).json({})
    }

    public refreshSession(req: Request, res: Response): void {
        const payload = this.cleanUser(req.user)
        const authToken = jwt.sign(payload, this.jwtSecret, AuthConfig.JwtOptions)
        res.cookie(Cookies.jwt, authToken, AuthConfig.CookieOptions).json(payload)
    }

    public updateUser(id: string, update: any): Promise<ServiceResponse<IUser>> {
        return new Promise<ServiceResponse<IUser>>((resolve, reject) => {
            User.findByIdAndUpdate(id, update, { new: true }, (error, user) => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ServiceResponse(user))
            })
        })
    }

    public deleteUser(id: string): Promise<ServiceResponse<any>> {
        return new Promise<any>((resolve, reject) => {
            User.findByIdAndRemove(id, (error) => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ServiceResponse(null, HttpStatus.SUCCESS_noContent))
            })
        })
    }

    private cleanUser(user: IUser): IUser {
        const cleanUser = Object.assign({}, user)
        delete cleanUser.adminKey
        delete cleanUser.password
        return cleanUser
    }
}
