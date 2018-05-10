import { MongooseModel } from '../../../lib/goosetype'

export interface PopulateOptions {
    path: string
    model?: MongooseModel<any>
    populate?: PopulateOptions | string
}
