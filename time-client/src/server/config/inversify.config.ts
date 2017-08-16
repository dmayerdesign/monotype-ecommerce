import { interfaces, InversifyExpressServer, TYPE } from 'inversify-express-utils';
import { Container } from 'inversify';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import * as express from 'express';

import { TYPES, TAGS } from '@time/constants/inversify';

import { AppController, UserController, ProductsController } from '../controllers';
import { ProductService, UserService } from '../services';
import { WoocommerceMigrationService } from '@time/api-services';
import { DbClient, ProductSearchUtils } from '@time/api-utils';

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
container.bind<ProductSearchUtils>(TYPES.ProductSearchUtils).to(ProductSearchUtils);
container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<ProductService>(TYPES.ProductService).to(ProductService);
container.bind<WoocommerceMigrationService>(TYPES.WoocommerceMigrationService).to(WoocommerceMigrationService);

container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed(TAGS.UserController);
container.bind<interfaces.Controller>(TYPE.Controller).to(ProductsController).whenTargetNamed(TAGS.ProductsController);
container.bind<interfaces.Controller>(TYPE.Controller).to(AppController).whenTargetNamed(TAGS.AppController);

export { container }