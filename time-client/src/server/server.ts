require('dotenv').config()

import * as bodyParser from 'body-parser'
import * as compression from 'compression'
import * as express from 'express'
import * as session from 'express-session'
import * as validator from 'express-validator'
import * as fs from 'fs'
import * as glob from 'glob'
import * as helmet from 'helmet'
import { InversifyExpressServer } from 'inversify-express-utils'
import * as morgan from 'morgan'
import * as passport from 'passport'
import * as path from 'path'
import 'reflect-metadata'

import { passportConfig } from './auth/passport'
import { container } from './config/inversify.config'
import { mongoConnection } from './db/mongo.connection'
import { isProduction } from './utils/env'
import { initStartupTasks } from './utils/startup'

/** ANGULAR UNIVERSAL - imports */
import * as ngUniversal from '@nguniversal/express-engine'
import 'zone.js/dist/zone-node'
import { AppServerModule } from '../client/app/app.server.module'

const MongoStore = require('connect-mongo')(session)

function serverErrorConfig(app) {
    app.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(500).send('Something broke!')
    })
}

function serverConfig(app) {
    app.set('port', process.env.PORT)
    app.use(express.static('dist/public'))
    app.use('/scripts', express.static('node_modules'))
    app.use('/assets', express.static('dist/public/assets'))
    app.use('/images', express.static('dist/public/assets/images'))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    if (!isProduction()) app.use(morgan('dev'))
    app.use(helmet())
    app.disable('x-powered-by') // removes "x-powered-by: express" from the header to avoid specifically-targeted attacks
    app.use(validator())

    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
        store: new MongoStore({
            url: process.env.MONGOLAB_URI || process.env.MONGODB_URI,
            // autoReconnect: true,
            ttl: 14 * 24 * 60 * 60, // 2 weeks
        }),
    }))
    app.use(passport.initialize())
    app.use(passport.session())

    passportConfig()
    initStartupTasks()

    app.get('/ping', (req, res) => res.sendStatus(204))

    /** ANGULAR UNIVERSAL - bootstrap */
    // app.engine('html', ngUniversal.ngExpressEngine({
    //     bootstrap: AppServerModule,
    // }))
    // app.set('view engine', 'html')
    // app.set('views', 'dist/public')
}

/**
 * Connect to the database and start the server
 */
const server = new InversifyExpressServer(container)
mongoConnection.connect(() => {
    server
        .setConfig(serverConfig)
        .setErrorConfig(serverErrorConfig)
        .build()
        .listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT} :)`))
})

exports = module.exports = server
