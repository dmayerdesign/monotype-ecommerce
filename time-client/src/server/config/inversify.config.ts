import { interfaces, InversifyExpressServer, TYPE } from 'inversify-express-utils';
import { Container } from 'inversify';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';

import TYPES from '../constants/inversify/types';
import TAGS from '../constants/inversify/tags';

import { HomeController, UserController, ProductsController } from '../controllers';
import { ProductService, UserService } from '../services';

// load everything needed to the Container
let container = new Container();

if ((<any>process.env).ENVIRONMENT === 'DEV') {
  let logger = makeLoggerMiddleware();
  container.applyMiddleware(logger);
  // require('dotenv').config({silent: true});
}

container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<ProductService>(TYPES.ProductService).to(ProductService);
container.bind<interfaces.Controller>(TYPE.Controller).to(HomeController).whenTargetNamed(TAGS.HomeController);
container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed(TAGS.UserController);
container.bind<interfaces.Controller>(TYPE.Controller).to(ProductsController).whenTargetNamed(TAGS.ProductsController);

export { container }