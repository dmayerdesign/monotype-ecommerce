import * as bcrypt from 'bcrypt-nodejs'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import * as jwt from 'jsonwebtoken'

import { User } from '@mte/common/api/entities/user'
import { Wishlist } from '@mte/common/api/entities/wishlist'
import { Login } from '@mte/common/api/interfaces/login'
import { PopulateOptions } from '@mte/common/api/interfaces/populate-options'
import { ApiErrorResponse } from '@mte/common/api/responses/api-error.response'
import { ApiResponse } from '@mte/common/api/responses/api.response'
import { AuthConfig } from '@mte/common/config/auth.config'
import { Cookies, Copy, HttpStatus } from '@mte/common/constants'
import { Types } from '@mte/common/constants/inversify/types'
import { UserHelper } from '@mte/common/helpers/user.helper'
import { DbClient } from '../data-access/db-client'

@injectable()
export class UserService {

    private jwtSecret = process.env.JWT_SECRET
    @inject(Types.DbClient) private dbClient: DbClient<User>

    private userPopulateOptions: PopulateOptions = {
        path: 'wishlist',
        model: Wishlist.getModel(),
    }

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
                reject(new ApiErrorResponse(error, HttpStatus.CLIENT_ERROR_BAD_REQUEST))
            }

            try {

                // Check for an existing user.

                const existingUser = await this.dbClient.findOne(User, { email: user.email.toLowerCase() }, [ this.userPopulateOptions ])

                // If there's no existing user, create a new one.

                if (!existingUser) {
                    const newUser = new User({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email.toLowerCase(),
                        password: hash,
                    })

                    let savedUser = await this.dbClient.save(newUser)

                    // Create a wishlist for the user.

                    const newWishlist = new Wishlist({
                        user: savedUser._id
                    })
                    const savedWishlist = await this.dbClient.save(newWishlist)
                    savedUser.wishlist = savedWishlist._id
                    savedUser = await this.dbClient.save(savedUser)

                    console.log('==== Saved user ====')
                    console.log(savedUser)

                    // Create the JWT token and the JWT cookie.

                    const payload = UserHelper.cleanUser(savedUser)
                    const authToken = jwt.sign(payload, this.jwtSecret, AuthConfig.JwtOptions)

                    res.cookie(Cookies.jwt, authToken, AuthConfig.CookieOptions).json(payload)
                    resolve()
                }
                else {
                    reject(new ApiErrorResponse(
                        new Error(Copy.ErrorMessages.userEmailExists),
                        HttpStatus.CLIENT_ERROR_BAD_REQUEST,
                    ))
                }
            }
            catch (error) {
                reject(new ApiErrorResponse(error, HttpStatus.CLIENT_ERROR_BAD_REQUEST))
            }
        })
    }

    public login(credentials: Login, res: Response): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {

                // Find a user with the provided email.

                const user = await this.dbClient.findOne(User, {
                    email: credentials.email.toLowerCase()
                }, [ this.userPopulateOptions ])

                // If no user is found, send a 404.

                if (!user) {
                    reject(new ApiErrorResponse(new Error(Copy.ErrorMessages.userNotFound), HttpStatus.CLIENT_ERROR_NOT_FOUND))
                    return
                }

                // If a user is found, authenticate their password.

                const authenticated: boolean = bcrypt.compareSync(credentials.password, user.password)
                if (authenticated) {
                    const payload = UserHelper.cleanUser(user)
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
                reject(new ApiErrorResponse(error, HttpStatus.CLIENT_ERROR_BAD_REQUEST))
            }
        })
    }

    public logout(res: Response): void {
        res.clearCookie(Cookies.jwt).json({})
    }

    public refreshSession(req: Request, res: Response): void {
        const payload = UserHelper.cleanUser((req as any).user)
        const authToken = jwt.sign(payload, this.jwtSecret, AuthConfig.JwtOptions)
        res.cookie(Cookies.jwt, authToken, AuthConfig.CookieOptions)
        res.json(payload)
    }

    public updateUser(id: string, update: any): Promise<ApiResponse<User>> {
        return new Promise<ApiResponse<User>>(async (resolve, reject) => {
            try {
                const { _doc } = await this.dbClient.updateById(User, id, update)
                const user = _doc
                resolve(new ApiResponse(user))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public deleteUser(id: string): Promise<ApiResponse<null>> {
        return new Promise<ApiResponse<null>>(async (resolve, reject) => {
            try {
                await this.dbClient.delete(User, id)
                resolve(new ApiResponse(null, HttpStatus.SUCCESS_NO_CONTENT))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public verifyEmail(token: string): Promise<ApiResponse<User>> {
        return new Promise<ApiResponse<User>>(async (resolve, reject) => {
            try {
                const user = await this.dbClient.findOne(User, { emailVerificationToken: token }, [ this.userPopulateOptions ])

                if (!user) {
                    reject(new ApiErrorResponse(new Error('User not found - the email verification token did not match any token in the database'), HttpStatus.CLIENT_ERROR_NOT_FOUND))
                }
                else {
                    if (user.emailTokenExpires < Date.now()) {
                        reject(new ApiErrorResponse(new Error('Verification token has expired'), HttpStatus.CLIENT_ERROR_BAD_REQUEST))
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
}
