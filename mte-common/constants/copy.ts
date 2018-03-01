export class Copy {
    public static ErrorMessages = {
        emailNotVerified: 'Your email hasn\'t yet been verified. Follow the link in the email we sent you to verify your account.',
        generic: 'Oops! Something went wrong. Please refresh the page and try again.',
        invalidPassword: 'Wrong password. Try again.',

        // OrganizationService
        findOrganizationError: 'Failed to look up the organization.',

        // OrderService
        findOrderError: 'Failed to look up the order.',
        itemOutOfStockError: 'Oh no — one of your chosen items is out of stock!',

        // UserService
        userEmailExists: 'Looks like there\'s already an account with that email. Try logging in!',
        usernameExists: 'Looks like there\'s already an account with that username. Try logging in!',
        userNotAuthorized: 'You don\'t have permission to do that. Sorry!',
        userNotFound: 'We couldn\'t find a user with that email address.',
    }

    public static FormErrors = {
        fieldError: {
            email: 'Invalid email.',
            required: 'This field is required.'
        }
    }

    public static Warnings = {
        userNotLoggedIn: 'You\'re not logged in.',
    }

    public static Actions = {
        cancel: 'Cancel',
    }

    public static DaysOfTheWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ]
    public static Months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ]
}
