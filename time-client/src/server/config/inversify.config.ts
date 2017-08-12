import { interfaces, InversifyExpressServer, TYPE } from 'inversify-express-utils';
import { Container } from 'inversify';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import * as express from 'express';

import { TYPES, TAGS } from '@time/constants/inversify';

import { HomeController, UserController, ProductsController } from '../controllers';
import { ProductService, UserService } from '../services';
import { WoocommerceMigrationService } from '@time/api-services';
import { DbClient } from '@time/api-utils';

/**
 * Middleware
 */
import { Authenticate } from '../auth/authenticate';

// load everything needed to the Container
let container = new Container();

if ((<any>process.env).ENVIRONMENT === 'DEV') {
  let logger = makeLoggerMiddleware();
  container.applyMiddleware(logger);
}

container.bind<DbClient<any>>(TYPES.DbClient).to(DbClient);
container.bind<Authenticate>(TYPES.Authenticate).to(Authenticate);
container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<ProductService>(TYPES.ProductService).to(ProductService);
container.bind<WoocommerceMigrationService>(TYPES.WoocommerceMigrationService).to(WoocommerceMigrationService);

container.bind<interfaces.Controller>(TYPE.Controller).to(HomeController).whenTargetNamed(TAGS.HomeController);
container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed(TAGS.UserController);
container.bind<interfaces.Controller>(TYPE.Controller).to(ProductsController).whenTargetNamed(TAGS.ProductsController);

export { container }