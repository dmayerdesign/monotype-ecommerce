export class Types {
    public static DbClient = Symbol('DbClient')
    public static UserService = Symbol('UserService')
    public static ProductService = Symbol('ProductService')
    public static WoocommerceMigrationService = Symbol('WoocommerceMigrationService')
    public static Authenticate = Symbol('Authenticate')
    public static ProductSearchUtils = Symbol('ProductSearchUtils')
    public static isAuthenticated = Symbol('isAuthenticated')
    public static isAuthorized = Symbol('isAuthorized')
}

export default Types
