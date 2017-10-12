import { isDev } from '../utils/env'
const mongoose = require('mongoose')

mongoose.Promise = global.Promise
if (isDev()) mongoose.set('debug', true)

export const mongoConnection = {
    connect(done) {
        mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI, { useMongoClient: true })
        mongoose.connection.config['autoIndex'] = true // set to false to boost performance in production
        mongoose.connection.on('connected', () => {
            done()
        })
    }
}
