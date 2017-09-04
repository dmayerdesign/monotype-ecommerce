import { injectable } from 'inversify'
import { Request } from 'express'
import { IUser } from '@time/common/models/interfaces'
import { User } from '@time/common/models'
import TYPES from '@time/common/constants/inversify/types'
import CONSTANTS from '@time/common/constants'

@injectable()
export class UserService {

    public getUser(id: string): Promise<IUser> {
        return new Promise<IUser>((resolve, reject) => {
            User.findById(id, (error, user: IUser): void => {
                if (error) reject(error)
                else resolve(this.cleanUser(user))
            })
        })
    }

    public isUserLoggedIn(req: Request): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (req.isAuthenticated() && req.user) {
                resolve({ isLoggedIn: true })
            }
            else {
                resolve({ isLoggedIn: false })
            }
        })
    }

    public register(user: IUser): Promise<IUser> {
        return new Promise<IUser>((resolve, reject) => {
            
            /** Initialize, decrypt password **/
            const password: string = user.password
            let invalidInput: boolean = false
            delete user.password

            /** Create email verification token **/
            user.emailVerificationToken = (Date.now().toString(36) + Math.random().toString(36).substr(4))

            /** Validations **/
            const inputsToSanitize = [
                user.firstName,
                user.lastName,
            ]
            inputsToSanitize.forEach(input => {
                if (input && input.match(/\W+/)) invalidInput = true
            })
            if (!user.lastName) invalidInput = true
            if (invalidInput)
                reject(new Error(`${CONSTANTS.ERRORS.TAGS.registrationError} Invalid registration.`))
            if (!user.email.match(CONSTANTS.REGEX.emailAddress))
                reject(new Error(`${CONSTANTS.ERRORS.TAGS.registrationError} Please provide a valid email address.`))
            if (!password)
                reject(new Error(`${CONSTANTS.ERRORS.TAGS.registrationError} You must choose a valid password.`))

            User.find({email: user.email}).then(users => {
                if (users && users.length) {
                    return reject(new Error(`${CONSTANTS.ERRORS.TAGS.registrationError} ${CONSTANTS.ERRORS.userEmailExists}`))
                }
                // User.register(new User(user), password, (err, newUser) => {
                //     if (err) return reject(err)
                //     resolve(newUser)

                    /*
                    let notificationEmailOptions = { ...appConfig.emailOptions.default }
                    let verificationEmailOptions = { ...appConfig.emailOptions.default }
                    notificationEmailOptions.user = newUser
                    notificationEmailOptions.fields = []
                    verificationEmailOptions.user = newUser

                    this.emailService.sendUserJoinedNotification(notificationEmailOptions)

                    this.emailService.sendEmailVerification(verificationEmailOptions, (err, data) => {
                        if (catchErr(res, err, "There was an error sending your verification email.")) return
                        resolve(newUser)
                    })
                    */
                // })
            })
        })
    }

    public updateUser(id: string, update: any): Promise<IUser> {
        return new Promise<IUser>((resolve, reject) => {
            User.findByIdAndUpdate(id, update, { new: true }, (error, user) => {
                if (error) reject(error)
                else resolve(user)
            })
        })
    }

    public deleteUser(id: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            User.findByIdAndRemove(id, (error) => {
                if (error) reject(error)
                else resolve()
            })
        })
    }

    private cleanUser(user: IUser): IUser {
        let cleanUser = Object.assign({}, user)
        delete cleanUser.adminKey
        delete cleanUser.password
        return cleanUser
    }
}
