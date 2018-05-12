import { prop, schema, MongooseDocument } from '../../lib/goosetype'
import { Currency } from '../enums/currency'

@schema(Price, { _id: false })
export class Price extends MongooseDocument {
    @prop() public amount: number
    @prop({ enum: Currency }) public currency: string
}
