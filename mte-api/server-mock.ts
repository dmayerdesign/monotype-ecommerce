import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as helmet from 'helmet'
import { InversifyExpressServer } from 'inversify-express-utils'
import * as passport from 'passport'
import { container } from './config/inversify.config'
import { connect } from './data-access/mongo-connection'
import { onStart } from './helpers/startup'

function serverErrorConfig(app): void {
    app.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(500).send('Something broke!')
    })
}

function serverConfig(app): void {
    app.set('view engine', 'html')
    app.set('views', 'dist/public')
    app.set('port', process.env.PORT)
    app.use(cookieParser())
    app.use(express.static('dist/public'))
    app.use('/assets', express.static('dist/public/assets'))
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(helmet())
    app.disable('x-powered-by') // removes "x-powered-by: express" from the header to avoid specifically-targeted attacks
    app.use(passport.initialize())
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
