import 'reflect-metadata';
import * as express from 'express';
import { interfaces, InversifyExpressServer, TYPE } from 'inversify-express-utils';
import { Container } from 'inversify';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import TYPES from './constant/types';
import TAGS from './constant/tags';
import { HomeController } from './controller/home';
import { MongoDBClient } from './utils/mongodb/client';
import { UserController } from './controller/user';
import { UserService } from './service/user';
import { passportConfig } from './auth/passport';
import * as morgan from 'morgan';
import * as validator from 'express-validator';
import * as session from 'express-session';
import * as passport from 'passport';
import * as mongoose from 'mongoose';

const q = require('q');
const MongoStore = require('connect-mongo')(session);

//use q promises
global.Promise = q.Promise;
mongoose.Promise = q.Promise;

// load everything needed to the Container
let container = new Container();

if ((<any>process.env).ENVIRONMENT === 'DEV') {
  let logger = makeLoggerMiddleware();
  container.applyMiddleware(logger);
  require('dotenv').config({silent: true});
}

// container.bind<interfaces.Controller>(TYPE.Controller).to(HomeController).whenTargetNamed(TAGS.HomeController);
container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed(TAGS.UserController);
container.bind<MongoDBClient>(TYPES.MongoDBClient).to(MongoDBClient);
container.bind<UserService>(TYPES.UserService).to(UserService);

// start the server
let server = new InversifyExpressServer(container);
server.setConfig((app) => {

  require('express-ws')(app);

  app.set('port', process.env.PORT || 3000);

  app.use(express.static('dist/public'));
  app.use('/scripts', express.static('node_modules'));
  app.use('/static', express.static('dist/public/static'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(morgan('dev'));
  app.use(helmet());
  app.disable('x-powered-by'); // removes "x-powered-by: express" from the header to avoid specifically-targeted attacks
  app.use(validator());

  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
      url: process.env.MONGOLAB_URI || process.env.MONGODB_URI,
      // autoReconnect: true,
      ttl: 14 * 24 * 60 * 60, // 2 weeks
    }),
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  passportConfig();

  if (process.env.ENVIRONMENT !== "DEV") {
    app.get('*.js', (req, res, next) => {
      req.url = req.url + '.gz';
      res.set('Content-Encoding', 'gzip');
      next();
    });
  }

  app.get('/ping', (req, res) => {
    res.sendStatus(200);
  });

  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'dist/public' });
  });

});

let app = server.build();
app.listen(3000);
console.log('Server started on port 3000 :)');

exports = module.exports = app;
