import { prop, MongooseDocument } from '../../lib/goosetype'
import { Currency } from '../enums/currency'

export class Price extends MongooseDocument<Price> {
    @prop() public amount: number
    @prop({ enum: Currency }) public currency: string
}
