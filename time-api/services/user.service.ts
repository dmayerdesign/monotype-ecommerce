import * as bcrypt from 'bcrypt-nodejs'
import { Request, Response } from 'express'
import { injectable } from 'inversify'
import * as jwt from 'jsonwebtoken'

import { AuthConfig } from '@time/common/config/auth.config'
import { Cookies, Copy, HttpStatus } from '@time/common/constants'
import { User, UserModel } from '@time/common/models/api-models/user'
import { ApiErrorResponse, ApiResponse } from '@time/common/models/helpers'
import { ILogin } from '@time/common/models/interfaces/login'

@injectable()
export class UserService {

    private jwtSecret = process.env.JWT_SECRET

    public register(user: User, res: Response): Promise<null> {
        return new Promise<null>(async (resolve, reject) => {
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

            // Check for an existing user.

            try {
                const existingUser = await UserModel.findOne({ email: user.email })

                if (!existingUser) {
                    const newUser = new UserModel({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        password: hash,
                    })

                    const savedUser = await newUser.save()
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
                reject(new ApiErrorResponse(error, HttpStatus.CLIENT_ERROR_badRequest))
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
        res.cookie(Cookies.jwt, authToken, AuthConfig.CookieOptions)
    }

    public updateUser(id: string, update: any): Promise<ApiResponse<User>> {
        return new Promise<ApiResponse<User>>(async (resolve, reject) => {
            try {
                const user = await UserModel.findByIdAndUpdate(id, update, { new: true })
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
                const user = await UserModel.findOne({ emailVerificationToken: token })

                if (!user) {
                    reject(new ApiErrorResponse(new Error("User not found - the email verification token did not match any token in the database"), HttpStatus.CLIENT_ERROR_notFound))
                }
                else {
                    if (user.emailTokenExpires < Date.now()) {
                        reject(new ApiErrorResponse(new Error("Verification token has expired"), HttpStatus.CLIENT_ERROR_badRequest))
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

    private cleanUser(user: User): User {
        const cleanUser = Object.assign({}, user)
        delete cleanUser.adminKey
        delete cleanUser.password
        return cleanUser
    }
}
