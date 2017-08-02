import { interfaces, InversifyExpressServer, TYPE } from 'inversify-express-utils';
import { Container } from 'inversify';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';

import TYPES from '../constants/inversify/types';
import TAGS from '../constants/inversify/tags';

import { FooController } from '../controllers/foo.controller';

// load everything needed to the Container
let container = new Container();

if ((<any>process.env).ENVIRONMENT === 'DEV') {
  let logger = makeLoggerMiddleware();
  container.applyMiddleware(logger);
  require('dotenv').config({silent: true});
}

container.bind<interfaces.Controller>(TYPE.Controller).to(FooController).whenTargetNamed('FooController');

// container.bind<interfaces.Controller>(TYPE.Controller).to(HomeController).whenTargetNamed(TAGS.HomeController);
// container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed(TAGS.UserController);
// container.bind<DBClient>(TYPES.DBClient).to(DBClient);
// container.bind<UserService>(TYPES.UserService).to(UserService);

export { container }