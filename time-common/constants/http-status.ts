export enum HttpStatus {
    SUCCESS_ok = 200,
    SUCCESS_created = 201,
    SUCCESS_acceptedNotCompleted = 202,
    SUCCESS_noContent = 204,

    CLIENT_ERROR_badRequest = 400,
    CLIENT_ERROR_unauthorized = 401,
    CLIENT_ERROR_paymentRequired = 402,
    CLIENT_ERROR_forbidden = 403,
    CLIENT_ERROR_notFound = 404,
    CLIENT_ERROR_timeout = 408,
    CLIENT_ERROR_payloadTooLarge = 413,

    SERVER_ERROR_internal = 500,
    SERVER_ERROR_notImplemented = 501,
    SERVER_ERROR_badGateway = 502,
    SERVER_ERROR_serviceUnavailable = 503,
    SERVER_ERROR_timeout = 504,
}
