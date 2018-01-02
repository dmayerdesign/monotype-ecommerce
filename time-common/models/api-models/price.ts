import { Currency } from '../enums/currency'
import { prop, MongooseDocument } from '../../utils/goosetype'

export class Price extends MongooseDocument<Price> {
    @prop() public total: number
    @prop({ enum: Currency }) public currency: string
}
