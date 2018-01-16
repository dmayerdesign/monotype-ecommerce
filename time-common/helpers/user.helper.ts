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
}
