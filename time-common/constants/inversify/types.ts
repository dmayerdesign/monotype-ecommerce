export class Types {
    public static Authenticate = Symbol('Authenticate')
    public static DbClient = Symbol('DbClient')
    public static DiscountService = Symbol('DiscountService')
    public static EmailFactory = Symbol('EmailFactory')
    public static EmailService = Symbol('EmailService')
    public static ProductSearchUtils = Symbol('ProductSearchUtils')
    public static ProductService = Symbol('ProductService')
    public static StripeService = Symbol('StripeService')
    public static UserService = Symbol('UserService')
    public static WoocommerceMigrationService = Symbol('WoocommerceMigrationService')
    public static isAuthenticated = Symbol('isAuthenticated')
    public static isAuthorized = Symbol('isAuthorized')
}

export default Types
