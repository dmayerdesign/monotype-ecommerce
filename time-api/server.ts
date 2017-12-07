require('dotenv').config()

import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as validator from 'express-validator'
import * as helmet from 'helmet'
import { InversifyExpressServer } from 'inversify-express-utils'
import * as morgan from 'morgan'
import * as passport from 'passport'
import 'reflect-metadata'
import * as xhr from 'xmlhttprequest'

import { passportConfig } from './auth/passport'
import { container } from './config/inversify.config'
import { connect } from './data-access/mongo-connection'
import { isProduction } from './utils/env'
import { onStart } from './utils/startup'

// ANGULAR UNIVERSAL
global['XMLHttpRequest'] = xhr.XMLHttpRequest
import * as ngUniversal from '@nguniversal/express-engine'
import 'zone.js/dist/zone-node'
import { AppServerModule } from '../time-client/src/app/app.server.module'

function serverErrorConfig(app) {
    app.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(500).send('Something broke!')
    })
}

function serverConfig(app) {
    // ANGULAR UNIVERSAL - bootstrap
    app.engine('html', ngUniversal.ngExpressEngine({
        bootstrap: AppServerModule,
    }))
    app.set('view engine', 'html')
    app.set('views', 'dist/public')

    app.set('port', process.env.PORT)
    app.use(cookieParser())
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
    app.use(passport.initialize())
    app.get('/ping', (req, res) => res.sendStatus(204))

    passportConfig()
    onStart()
}

// Connect to the database and start the server
const server = new InversifyExpressServer(container)
connect().then(() => {
    server
        .setConfig(serverConfig)
        .setErrorConfig(serverErrorConfig)
        .build()
        .listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT} :D`))
})

exports = module.exports = server
