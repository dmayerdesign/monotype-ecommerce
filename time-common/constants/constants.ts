export class Constants {
    public static Cookies = {
        jwtToken: "JWT_TOKEN"
    }

    public static Errors = {
        TAGS: {
            internalError: "INTERNAL ERROR:",
            schemaError: "SCHEMA ERROR:",
            registrationError: "REGISTRATION ERROR:"
        },
        emailNotVerified: "Your email hasn't yet been verified. Follow the link in the email we sent you to verify your account.",
        genericErrorMessage: "Oops! Something went wrong. Please try again.",
        invalidPassword: "Wrong password. Try again.",
        userEmailExists: "Looks like there's already an account with that email. Try logging in!",
        usernameExists: "Looks like there's already an account with that username. Try logging in!",
        userNotAuthorized: "You don't have permission to do that. Sorry!",
    }

    public static Pagination = {
        productsPerPage: 30,
    }

    public static Regex = {
        emailAddress: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        date: /^(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/,
        password1: /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]/,
        postalCode: /^(([0-9]{5}$)|([0-9]{5}-[0-9]{4}$))/,
        username: /^\w+$/,
    }

    public static Warnings = {
        userNotLoggedIn: "You're not logged in.",
    }
}

export default Constants
