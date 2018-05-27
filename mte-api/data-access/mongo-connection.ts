import * as mongoose from 'mongoose'
import { Promise } from 'mongoose'
import { isDev } from '../helpers/env.helper'

(mongoose as any).Promise = global.Promise
// if (isDev()) mongoose.set('debug', true)

export function connect(): Promise<void> { // I believe this is technically a `MongooseThenable`, not an actual Promise.
    return mongoose.connect(process.env.MONGODB_URI, {
        autoIndex: isDev() ? true : false,
    } as any)
}
