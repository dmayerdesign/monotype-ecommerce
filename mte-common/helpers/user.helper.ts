import { User } from '../api/entities/user'

export class UserHelper {
    public static getFullName(user: { firstName: string, lastName: string }): string {
        if (user.firstName && !user.lastName) {
            return user.firstName
        }
        else if (user.lastName && !user.firstName) {
            return user.lastName
        }
        return `${user.firstName} ${user.lastName}`
    }

    public static cleanUser(user: User): User {
        const cleanUser = Object.assign({}, user)
        delete cleanUser.role
        delete cleanUser.password

        // Delete JWT properties.
        delete (cleanUser as any).iat
        delete (cleanUser as any).exp

        return cleanUser
    }
}
