import { isDev } from '../utils/env'
const mongoose = require('mongoose')

mongoose.Promise = global.Promise
if (isDev()) mongoose.set('debug', true)

export function connect() {
    return mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI, {
        useMongoClient: true,
        autoIndex: isDev() ? true : false,
    })
}
