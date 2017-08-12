export const CONSTANTS = {
    ERRORS: {
        TAGS: {
            internalError: "INTERNAL ERROR:",
            schemaError: "SCHEMA ERROR:",
            registrationError: "REGISTRATION ERROR:"
        },
        emailNotVerified: "Your email hasn't yet been verified. Follow the link in the email we sent you to verify your account.",
        genericErrorMessage: "Oops! Something went wrong. Please try again.",
        userEmailExists: "Looks like there's already an account with that email. Try logging in!",
        usernameExists: "Looks like there's already an account with that username. Try logging in!",
        userNotAuthorized: "You don't have permission to do that. Sorry!",
    },

    HTTP: {
        SUCCESS_ok: 200,
        SUCCESS_created: 201,
        SUCCESS_acceptedNotCompleted: 202,
        SUCCESS_noContent: 204,

        CLIENT_ERROR_badRequest: 400,
        CLIENT_ERROR_unauthorized: 401,
        CLIENT_ERROR_paymentRequired: 402,
        CLIENT_ERROR_forbidden: 403,
        CLIENT_ERROR_notFound: 404,
        CLIENT_ERROR_timeout: 408,
        CLIENT_ERROR_payloadTooLarge: 413,

        SERVER_ERROR_internal: 500,
        SERVER_ERROR_notImplemented: 501,
        SERVER_ERROR_badGateway: 502,
        SERVER_ERROR_serviceUnavailable: 503,
        SERVER_ERROR_timeout: 504,
    },

    PAGINATION: {
        productsPerPage: 30,
    },

    REGEX: {
        emailAddress: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },

    WARNINGS: {
        userNotLoggedIn: "You're not logged in.",
    },
};

export default CONSTANTS;