import * as express from 'express'
import { Container } from 'inversify'
import { interfaces, InversifyExpressServer, TYPE } from 'inversify-express-utils'
import { makeLoggerMiddleware } from 'inversify-logger-middleware'

import { EmailService } from '@time/common/api-services'
import { DbClient, ProductSearchUtils } from '@time/common/api-utils'
import { Tags, Types } from '@time/common/constants/inversify'
import { EmailFactory } from '@time/common/emails'
import { Authenticate } from '../auth/authenticate'
import { AppController, ProductsController, UserController } from '../controllers'
import { DiscountService, ProductService, StripeService, UserService, WoocommerceMigrationService } from '../services'
import { isDev } from '../utils/env'

// load everything needed to the Container
const container = new Container()

if (isDev()) {
  const logger = makeLoggerMiddleware()
  container.applyMiddleware(logger)
}

// Services
container.bind<DbClient<any>>(Types.DbClient).to(DbClient)
container.bind<DiscountService>(Types.DiscountService).to(DiscountService)
container.bind<EmailFactory>(Types.EmailFactory).to(EmailFactory)
container.bind<EmailService>(Types.EmailService).to(EmailService)
container.bind<ProductSearchUtils>(Types.ProductSearchUtils).to(ProductSearchUtils)
container.bind<UserService>(Types.UserService).to(UserService)
container.bind<ProductService>(Types.ProductService).to(ProductService)
container.bind<StripeService>(Types.StripeService).to(StripeService)
container.bind<WoocommerceMigrationService>(Types.WoocommerceMigrationService).to(WoocommerceMigrationService)

// Middleware
container.bind(Types.isAuthenticated).toConstantValue(Authenticate.isAuthenticated)
container.bind(Types.isAuthorized).toConstantValue(Authenticate.isAuthorized)

// Controllers
container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed(Tags.UserController)
container.bind<interfaces.Controller>(TYPE.Controller).to(ProductsController).whenTargetNamed(Tags.ProductsController)
container.bind<interfaces.Controller>(TYPE.Controller).to(AppController).whenTargetNamed(Tags.AppController)

export { container }
