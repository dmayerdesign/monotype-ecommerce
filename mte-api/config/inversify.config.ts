import { Discount } from '@mte/common/api/entities/discount'
import { Order } from '@mte/common/api/entities/order'
import { Organization } from '@mte/common/api/entities/organization'
import { Product } from '@mte/common/api/entities/product'
import { Types } from '@mte/common/constants/inversify/types'
import { MongooseDocument } from '@mte/common/lib/goosetype'
import { Container } from 'inversify'
import { interfaces, TYPE } from 'inversify-express-utils'
import { makeLoggerMiddleware } from 'inversify-logger-middleware'
import { Authenticate } from '../auth/authenticate'
import { AppController } from '../controllers/app.controller'
import { CartController } from '../controllers/cart.controller'
import { InstagramController } from '../controllers/instagram.controller'
import { OrdersController } from '../controllers/orders.controller'
import { OrganizationController } from '../controllers/organization.controller'
import { ProductsAdminController } from '../controllers/products.admin.controller'
import { ProductsController } from '../controllers/products.controller'
import { TaxonomyTermsController } from '../controllers/taxonomy-terms.controller'
import { UserController } from '../controllers/user.controller'
import { DbClient } from '../data-access/db-client'
import { isDev } from '../helpers/env.helper'
import { OrderHelper } from '../helpers/order.helper'
import { ProductSearchHelper } from '../helpers/product-search.helper'
import { EmailService as IEmailService } from '../interfaces/email-service'
import { CartService } from '../services/cart.service'
import { CrudService } from '../services/crud.service'
import { DiscountService } from '../services/discount.service'
import { EasypostService } from '../services/easypost.service'
import { EmailService } from '../services/email.service'
import { ErrorService } from '../services/error.service'
import { InstagramService } from '../services/instagram.service'
import { OrderService } from '../services/order.service'
import { OrganizationService } from '../services/organization.service'
import { ProductService } from '../services/product.service'
import { StripeCustomerService } from '../services/stripe/stripe-customer.service'
import { StripeOrderActionsService } from '../services/stripe/stripe-order-actions.service'
import { StripeOrderService } from '../services/stripe/stripe-order.service'
import { StripeProductService } from '../services/stripe/stripe-product.service'
import { TaxonomyTermService } from '../services/taxonomy-term.service'
import { TaxonomyService } from '../services/taxonomy.service'
import { TimerService } from '../services/timer.service'
import { UserService } from '../services/user.service'
import { WishlistService } from '../services/wishlist.service'
import { WoocommerceMigrationService } from '../services/woocommerce-migration.service'

// The container is where you register DI bindings.

const container = new Container()

// If we're developing, apply logger middleware.

if (isDev()) {
  const logger = makeLoggerMiddleware()
  container.applyMiddleware(logger)
}

// Middleware.
container.bind(Types.isAuthenticated).toConstantValue(Authenticate.isAuthenticated)
container.bind(Types.isOwner).toConstantValue(Authenticate.isAuthorized(1))

// Services.
container.bind<DbClient<MongooseDocument>>(Types.DbClient).to(DbClient)
container.bind<CartService>(Types.CartService).to(CartService)
container.bind<CrudService<Discount>>(Types.DiscountService).to(DiscountService)
container.bind<EasypostService>(Types.EasypostService).to(EasypostService)
container.bind<IEmailService>(Types.EmailService).to(EmailService)
container.bind<ErrorService>(Types.ErrorService).to(ErrorService)
container.bind<InstagramService>(Types.InstagramService).to(InstagramService)
container.bind<OrderHelper>(Types.OrderHelper).to(OrderHelper)
container.bind<CrudService<Order>>(Types.OrderService).to(OrderService)
container.bind<CrudService<Organization>>(Types.OrganizationService).to(OrganizationService)
container.bind<ProductSearchHelper>(Types.ProductSearchHelper).to(ProductSearchHelper)
container.bind<CrudService<Product>>(Types.ProductService).to(ProductService)
container.bind<StripeCustomerService>(Types.StripeCustomerService).to(StripeCustomerService)
container.bind<StripeOrderActionsService>(Types.StripeOrderActionsService).to(StripeOrderActionsService)
container.bind<StripeOrderService>(Types.StripeOrderService).to(StripeOrderService)
container.bind<StripeProductService>(Types.StripeProductService).to(StripeProductService)
container.bind<TaxonomyService>(Types.TaxonomyService).to(TaxonomyService)
container.bind<TaxonomyTermService>(Types.TaxonomyTermService).to(TaxonomyTermService)
container.bind<TimerService>(Types.TimerService).to(TimerService)
container.bind<UserService>(Types.UserService).to(UserService)
container.bind<WishlistService>(Types.WishlistService).to(WishlistService)
container.bind<WoocommerceMigrationService>(Types.WoocommerceMigrationService).to(WoocommerceMigrationService)

// Controllers.
container.bind<interfaces.Controller>(TYPE.Controller).to(AppController).whenTargetNamed(Types.AppController)
container.bind<interfaces.Controller>(TYPE.Controller).to(CartController).whenTargetNamed(Types.CartController)
container.bind<interfaces.Controller>(TYPE.Controller).to(InstagramController).whenTargetNamed(Types.InstagramController)
container.bind<interfaces.Controller>(TYPE.Controller).to(OrdersController).whenTargetNamed(Types.OrdersController)
container.bind<interfaces.Controller>(TYPE.Controller).to(OrganizationController).whenTargetNamed(Types.OrganizationController)
container.bind<interfaces.Controller>(TYPE.Controller).to(ProductsAdminController).whenTargetNamed(Types.ProductsAdminController)
container.bind<interfaces.Controller>(TYPE.Controller).to(ProductsController).whenTargetNamed(Types.ProductsController)
container.bind<interfaces.Controller>(TYPE.Controller).to(TaxonomyTermsController).whenTargetNamed(Types.TaxonomyTermsController)
container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed(Types.UserController)

// Helper function for injecting into functions.
function bind(func: (...args: any[]) => any, dependencies: (string|symbol)[]): (...args: any[]) => any {
    const injections = dependencies.map((dependency) => {
        return container.get(dependency)
    })
    return func.bind(func, ...injections)
}

export { container, bind }
