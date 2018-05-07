import { MongooseModel } from '../../../lib/goosetype/goosetype'

export interface PopulateOptions {
    path: string
    model?: MongooseModel<any>
    populate?: PopulateOptions | string
}
