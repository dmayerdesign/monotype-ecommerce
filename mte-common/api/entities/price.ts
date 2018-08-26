import { Currency } from '../../constants/enums/currency'
import { prop, schema, MongooseDocument } from '../../lib/goosetype'

@schema(Price, { _id: false })
export class Price extends MongooseDocument {
    @prop() public amount: number
    @prop({ enum: Currency, type: String }) public currency: Currency
}
