import { Container } from 'inversify'
import { interfaces, TYPE } from 'inversify-express-utils'
import { makeLoggerMiddleware } from 'inversify-logger-middleware'

import { Tags, Types } from '@mte/common/constants/inversify'
import { MongooseDocument } from '@mte/common/lib/goosetype'
import { Authenticate } from '../auth/authenticate'
import { AppController } from '../controllers/app.controller'
import { InstagramController } from '../controllers/instagram.controller'
import { OrganizationController } from '../controllers/organization.controller'
import { ProductsAdminController } from '../controllers/products.admin.controller'
import { ProductsController } from '../controllers/products.controller'
import { TaxonomyTermsController } from '../controllers/taxonomy-terms.controller'
import { UserController } from '../controllers/user.controller'
import { DbClient } from '../data-access/db-client'
import { isDev } from '../helpers/env.helper'
import { OrderHelper } from '../helpers/order.helper'
import { ProductSearchHelper } from '../helpers/product-search.helper'
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

import { Discount } from '@mte/common/models/api-models/discount'
import { Order } from '@mte/common/models/api-models/order'
import { Organization } from '@mte/common/models/api-models/organization'
import { Product } from '@mte/common/models/api-models/product'

// The container is where you register DI bindings.

const container = new Container()

// If we're developing, apply logger middleware.

if (isDev()) {
  const logger = makeLoggerMiddleware()
  container.applyMiddleware(logger)
}

// Services.
container.bind<DbClient<MongooseDocument>>(Types.DbClient).to(DbClient)
container.bind<CrudService<Discount>>(Types.DiscountService).to(DiscountService)
container.bind<EasypostService>(Types.EasypostService).to(EasypostService)
container.bind<EmailService>(Types.EmailService).to(EmailService)
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

// Middleware.
container.bind(Types.isAuthenticated).toConstantValue(Authenticate.isAuthenticated)
container.bind(Types.isOwner).toConstantValue(Authenticate.isAuthorized(1))

// Controllers.
container.bind<interfaces.Controller>(TYPE.Controller).to(AppController).whenTargetNamed(Tags.AppController)
container.bind<interfaces.Controller>(TYPE.Controller).to(InstagramController).whenTargetNamed(Tags.InstagramController)
container.bind<interfaces.Controller>(TYPE.Controller).to(OrganizationController).whenTargetNamed(Tags.OrganizationController)
container.bind<interfaces.Controller>(TYPE.Controller).to(ProductsAdminController).whenTargetNamed(Tags.ProductsAdminController)
container.bind<interfaces.Controller>(TYPE.Controller).to(ProductsController).whenTargetNamed(Tags.ProductsController)
container.bind<interfaces.Controller>(TYPE.Controller).to(TaxonomyTermsController).whenTargetNamed(Tags.TaxonomyTermsController)
container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed(Tags.UserController)

// Helper function for injecting into functions.
function bind(func: (...args: any[]) => any, dependencies: (string|symbol)[]): (...args: any[]) => any {
    const injections = dependencies.map((dependency) => {
        return container.get(dependency)
    })
    return func.bind(func, ...injections)
}

export { container, bind }
