import * as bcrypt from 'bcrypt-nodejs'
import { Request } from 'express'
import { injectable } from 'inversify'
import * as jwt from 'jsonwebtoken'

import { CONSTANTS, HttpStatus } from '@time/common/constants'
import TYPES from '@time/common/constants/inversify/types'
import { ILogin, IUser, User } from '@time/common/models'
import { ServiceErrorResponse, ServiceResponse } from "@time/common/models/helpers"
import { IAuthResponse } from '@time/common/models/interfaces'
import { jwtConfig } from "../auth/passport"

@injectable()
export class UserService {

    public register(user: IUser): Promise<ServiceResponse<IAuthResponse>> {
        return new Promise<ServiceResponse<IAuthResponse>>((resolve, reject) => {
            const plainTextPassword = user.password
            let salt, hash

            // Hash password
            try {
                salt = bcrypt.genSaltSync(10)
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
                            const payload = {
                                email: savedUser.email,
                                firstName: savedUser.firstName,
                                lastName: savedUser.lastName,
                            }
                            const authToken = jwt.sign(payload, jwtConfig.secretOrKey)

                            resolve(new ServiceResponse({ authToken }))
                        })
                        .catch((error) => reject(new ServiceErrorResponse(error, HttpStatus.CLIENT_ERROR_badRequest)))
                    }
                    else {
                        reject(new ServiceErrorResponse(
                            new Error(CONSTANTS.ERRORS.userEmailExists),
                            CONSTANTS.HTTP.SUCCESS_ok,
                        ))
                    }
                }).catch((error) => reject(new ServiceErrorResponse(error, HttpStatus.CLIENT_ERROR_badRequest)))
        })
    }

    public login(credentials: ILogin): Promise<ServiceResponse<IAuthResponse>> {
        return new Promise<ServiceResponse<IAuthResponse>>((resolve, reject) => {

            /////////////////////////
            // FOR TESTING
            /////////////////////////

            const authToken = jwt.sign({
                email: "test@example.com"
            }, jwtConfig.secretOrKey)
            resolve(new ServiceResponse<IAuthResponse>({ authToken }))

            /*
            return User
                .findOne({
                    email: credentials.email
                })
                .then(user => {
                    try {
                        const authenticated: boolean = bcrypt.compareSync(credentials.password, user.password)
                        if (authenticated) {
                            const authToken = jwt.sign(this.cleanUser(user), jwtConfig.secretOrKey)
                            resolve(new ServiceResponse({ authToken }))
                        } else {
                            return reject(new ServiceErrorResponse(new Error(CONSTANTS.ERRORS.invalidPassword), 401))
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
