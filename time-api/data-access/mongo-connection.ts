import * as mongoose from 'mongoose'
import { MongooseThenable } from 'mongoose'
import { isDev } from '../helpers/env.helper'

(mongoose as any).Promise = global.Promise
if (isDev()) mongoose.set('debug', true)

export function connect(): MongooseThenable {
    return mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI, {
        useMongoClient: true,
        autoIndex: isDev() ? true : false,
    } as any)
}
