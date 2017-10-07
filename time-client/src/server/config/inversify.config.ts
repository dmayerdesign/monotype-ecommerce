import * as express from 'express'
import { Container } from 'inversify'
import { interfaces, InversifyExpressServer, TYPE } from 'inversify-express-utils'
import { makeLoggerMiddleware } from 'inversify-logger-middleware'

import { DbClient, ProductSearchUtils } from '@time/common/api-utils'
import { TAGS, TYPES } from '@time/common/constants/inversify'
import { AppController, ProductsController, UserController } from '../controllers'
import { ProductService, UserService, WoocommerceMigrationService } from '../services'
import { isDev } from '../utils/env'

/**
 * Middleware
 */
import { Authenticate } from '../auth/authenticate'

// load everything needed to the Container
const container = new Container()

if (isDev()) {
  const logger = makeLoggerMiddleware()
  container.applyMiddleware(logger)
}

// Services
container.bind<DbClient<any>>(TYPES.DbClient).to(DbClient)
container.bind<ProductSearchUtils>(TYPES.ProductSearchUtils).to(ProductSearchUtils)
container.bind<UserService>(TYPES.UserService).to(UserService)
container.bind<ProductService>(TYPES.ProductService).to(ProductService)
container.bind<WoocommerceMigrationService>(TYPES.WoocommerceMigrationService).to(WoocommerceMigrationService)

// Middleware
container.bind(TYPES.isAuthenticated).toConstantValue(Authenticate.isAuthenticated)
container.bind(TYPES.isAuthorized).toConstantValue(Authenticate.isAuthorized)

// Controllers
container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed(TAGS.UserController)
container.bind<interfaces.Controller>(TYPE.Controller).to(ProductsController).whenTargetNamed(TAGS.ProductsController)
container.bind<interfaces.Controller>(TYPE.Controller).to(AppController).whenTargetNamed(TAGS.AppController)

export { container }
