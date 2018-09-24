import * as mongoose from 'mongoose'
import { isDev } from '../helpers/env.helper'

(mongoose as any).Promise = global.Promise
if (isDev()) mongoose.set('debug', true)

// I believe this is technically a `MongooseThenable`, not an actual Promise.
export function connect(): Promise<void> {
    return mongoose.connect(process.env.MONGODB_URI, {
        autoIndex: isDev() ? true : false,
    } as any)
}
