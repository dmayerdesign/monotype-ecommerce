import * as bcrypt from 'bcrypt-nodejs'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import * as jwt from 'jsonwebtoken'

import { AuthConfig } from '@time/common/config/auth.config'
import { Cookies, Copy, HttpStatus } from '@time/common/constants'
import { Types } from '@time/common/constants/inversify'
import { User, UserModel } from '@time/common/models/api-models/user'
import { ApiErrorResponse } from '@time/common/models/api-responses/api-error.response'
import { ApiResponse } from '@time/common/models/api-responses/api.response'
import { Login } from '@time/common/models/interfaces/api/login'
import { DbClient } from '../data-access/db-client'

@injectable()
export class UserService {

    private jwtSecret = process.env.JWT_SECRET
    @inject(Types.DbClient) private dbClient: DbClient<User>

    public register(user: User, res: Response): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const plainTextPassword = user.password
            let salt, hash
            delete user.password

            // Hash the password.

            try {
                salt = bcrypt.genSaltSync(12)
                hash = bcrypt.hashSync(plainTextPassword, salt)
            }
            catch (error) {
                reject(new ApiErrorResponse(error, HttpStatus.CLIENT_ERROR_badRequest))
            }

            try {

                // Check for an existing user.

                const existingUser = await this.dbClient.findOne(UserModel, { email: user.email.toLowerCase() })

                // If there's no existing user, create a new one.

                if (!existingUser) {
                    const newUser = new UserModel({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email.toLowerCase(),
                        password: hash,
                    })

                    const savedUserResult = await newUser.save()
                    const savedUser = savedUserResult._doc

                    // Create the JWT token and the JWT cookie.

                    const payload = this.cleanUser(savedUser)
                    const authToken = jwt.sign(payload, this.jwtSecret, AuthConfig.JwtOptions)

                    res.cookie(Cookies.jwt, authToken, AuthConfig.CookieOptions).json(payload)
                    resolve()
                }
                else {
                    reject(new ApiErrorResponse(
                        new Error(Copy.ErrorMessages.userEmailExists),
                        HttpStatus.CLIENT_ERROR_badRequest,
                    ))
                }
            }
            catch (error) {
                reject(new ApiErrorResponse(error, HttpStatus.CLIENT_ERROR_badRequest))
            }
        })
    }

    public login(credentials: Login, res: Response): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {

                // Find a user with the provided email.

                const user = await this.dbClient.findOne(UserModel, {
                        email: credentials.email.toLowerCase()
                    })

                // If no user is found, send a 404.

                if (!user) {
                    reject(new ApiErrorResponse(new Error(Copy.ErrorMessages.userNotFound), HttpStatus.CLIENT_ERROR_notFound))
                    return
                }

                // If a user is found, authenticate their password.

                const authenticated: boolean = bcrypt.compareSync(credentials.password, user.password)
                if (authenticated) {
                    const payload = this.cleanUser(user)
                    const authToken = jwt.sign(payload, this.jwtSecret, AuthConfig.JwtOptions)

                    console.log('Login payload:')
                    console.log(payload)

                    res.cookie(Cookies.jwt, authToken, AuthConfig.CookieOptions).json(payload)
                    resolve()
                } else {
                    reject(new ApiErrorResponse(new Error(Copy.ErrorMessages.invalidPassword), 401))
                }
            }
            catch (error) {
                reject(new ApiErrorResponse(error, HttpStatus.CLIENT_ERROR_badRequest))
            }
        })
    }

    public logout(res: Response) {
        res.clearCookie(Cookies.jwt).json({})
    }

    public refreshSession(req: Request, res: Response) {
        const payload = this.cleanUser((req as any).user)

        console.log('Refresh session:')
        console.log(payload)

        const authToken = jwt.sign(payload, this.jwtSecret, AuthConfig.JwtOptions)
        res.cookie(Cookies.jwt, authToken, AuthConfig.CookieOptions)
        res.json(payload)
    }

    public updateUser(id: string, update: any): Promise<ApiResponse<User>> {
        return new Promise<ApiResponse<User>>(async (resolve, reject) => {
            try {
                const { _doc } = await UserModel.findByIdAndUpdate(id, update, { new: true })
                const user = _doc
                resolve(new ApiResponse(user))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public deleteUser(id: string) {
        return new Promise<ApiResponse<any>>(async (resolve, reject) => {
            try {
                await UserModel.findByIdAndRemove(id)
                resolve(new ApiResponse(null, HttpStatus.SUCCESS_noContent))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public verifyEmail(token: string) {
        return new Promise<ApiResponse<User>>(async (resolve, reject) => {
            try {
                const user = await this.dbClient.findOne(UserModel, { emailVerificationToken: token })

                if (!user) {
                    reject(new ApiErrorResponse(new Error('User not found - the email verification token did not match any token in the database'), HttpStatus.CLIENT_ERROR_notFound))
                }
                else {
                    if (user.emailTokenExpires < Date.now()) {
                        reject(new ApiErrorResponse(new Error('Verification token has expired'), HttpStatus.CLIENT_ERROR_badRequest))
                    }
                    else {
                        resolve(new ApiResponse(user))
                    }
                }
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public cleanUser(user: User): User {
        const cleanUser = Object.assign({}, user)
        delete cleanUser.role
        delete cleanUser.password

        // Delete JWT properties.
        delete (cleanUser as any).iat
        delete (cleanUser as any).exp

        return cleanUser
    }
}
