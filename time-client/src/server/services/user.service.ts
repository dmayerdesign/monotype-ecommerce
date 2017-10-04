import { IAuthResponse } from '@time/common/models/interfaces'
import * as bcrypt from 'bcrypt-nodejs'
import { Request } from 'express'
import { injectable } from 'inversify'
import * as jwt from 'jsonwebtoken'

import CONSTANTS from '@time/common/constants'
import TYPES from '@time/common/constants/inversify/types'
import { ILogin, IUser, User } from '@time/common/models'
import { jwtConfig } from "../auth/passport"

@injectable()
export class UserService {

    public register(user: IUser): Promise<IAuthResponse> {
        return new Promise<IAuthResponse>((resolve, reject) => {
            const plainTextPassword = user.password
            let salt, hash

            // Hash password
            try {
                salt = bcrypt.genSaltSync(10)
                hash = bcrypt.hashSync(plainTextPassword, salt)
            }
            catch (error) {
                reject({error, status: 400})
            }

            User
                .findOne({
                    email: user.email
                })
                .then(existingUser => {
                    if (!existingUser) {
                        // Create User in DB
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

                            resolve({ authToken })
                        })
                        .catch((error) => reject({error, status: 400}))
                    }
                    else {
                        reject({
                            error: new Error(CONSTANTS.ERRORS.userEmailExists),
                            status: CONSTANTS.HTTP.SUCCESS_ok,
                        })
                    }
                }).catch((error) => reject({error, status: 400}))
        })
    }

    public login(credentials: ILogin): Promise<IAuthResponse> {
        return new Promise<IAuthResponse>((resolve, reject) => {

            /////////////////////////
            // FOR TESTING
            /////////////////////////

            const authToken = jwt.sign({
                email: "test@example.com"
            }, jwtConfig.secretOrKey)
            resolve({ authToken })

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
                            resolve({ authToken })
                        } else {
                            return reject({error: new Error(CONSTANTS.ERRORS.invalidPassword), status: 401})
                        }
                    }
                    catch (error) {
                        reject({error, status: 400})
                    }
                })
                .catch((error) => reject({error, status: 400}))
            */
        })
    }

    public updateUser(id: string, update: any): Promise<IUser> {
        return new Promise<IUser>((resolve, reject) => {
            User.findByIdAndUpdate(id, update, { new: true }, (error, user) => {
                if (error) reject({error})
                else resolve(user)
            })
        })
    }

    public deleteUser(id: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            User.findByIdAndRemove(id, (error) => {
                if (error) reject({error})
                else resolve()
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
