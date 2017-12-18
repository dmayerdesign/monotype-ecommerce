import { Container } from 'inversify'
import { interfaces, TYPE } from 'inversify-express-utils'
import { makeLoggerMiddleware } from 'inversify-logger-middleware'

import { Tags, Types } from '@time/common/constants/inversify'
import { Authenticate } from '../auth/authenticate'
import { AppController } from '../controllers/app.controller'
import { ProductsController } from '../controllers/products.controller'
import { UserController } from '../controllers/user.controller'
import { DbClient } from '../data-access/db-client'
import { DiscountService } from '../services/discount.service'
// TODO: Figure out why easypost-node import breaks when this is added to DI
// import { EasypostService } from '../services/easypost.service'
import { EmailService } from '../services/email.service'
import { ErrorService } from '../services/error.service'
import { ProductService } from '../services/product.service'
import { StripeCustomerService } from '../services/stripe/stripe-customer.service'
import { StripeOrderActionsService } from '../services/stripe/stripe-order-actions.service'
import { StripeOrderService } from '../services/stripe/stripe-order.service'
import { StripeProductService } from '../services/stripe/stripe-product.service'
import { TimerService } from '../services/timer.service'
import { UserService } from '../services/user.service'
import { WoocommerceMigrationService } from '../services/woocommerce-migration.service'
import { isDev, ProductSearchUtils } from '../utils'

// load everything needed to the Container
const container = new Container()

if (isDev()) {
  const logger = makeLoggerMiddleware()
  // container.applyMiddleware(logger)
}

// Services
container.bind<DbClient<any>>(Types.DbClient).to(DbClient)
container.bind<DiscountService>(Types.DiscountService).to(DiscountService)
// container.bind<EasypostService>(Types.EasypostService).to(EasypostService)
container.bind<EmailService>(Types.EmailService).to(EmailService)
container.bind<ErrorService>(Types.ErrorService).to(ErrorService)
container.bind<ProductSearchUtils>(Types.ProductSearchUtils).to(ProductSearchUtils)
container.bind<UserService>(Types.UserService).to(UserService)
container.bind<ProductService>(Types.ProductService).to(ProductService)
container.bind<StripeCustomerService>(Types.StripeCustomerService).to(StripeCustomerService)
container.bind<StripeOrderActionsService>(Types.StripeOrderActionsService).to(StripeOrderActionsService)
container.bind<StripeOrderService>(Types.StripeOrderService).to(StripeOrderService)
container.bind<StripeProductService>(Types.StripeProductService).to(StripeProductService)
container.bind<WoocommerceMigrationService>(Types.WoocommerceMigrationService).to(WoocommerceMigrationService)
container.bind<TimerService>(Types.TimerService).to(TimerService)

// Middleware
container.bind(Types.isAuthenticated).toConstantValue(Authenticate.isAuthenticated)
container.bind(Types.isAuthorized).toConstantValue(Authenticate.isAuthorized)

// Controllers
container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed(Tags.UserController)
container.bind<interfaces.Controller>(TYPE.Controller).to(ProductsController).whenTargetNamed(Tags.ProductsController)
container.bind<interfaces.Controller>(TYPE.Controller).to(AppController).whenTargetNamed(Tags.AppController)

export { container }
