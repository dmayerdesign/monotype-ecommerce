import { CurrencyEnum } from '../../constants/currency'
import { prop, MongooseDocument } from '../../utils/goosetype'

export class Price extends MongooseDocument<Price> {
    @prop() public total: number
    @prop({ enum: Object.keys(CurrencyEnum) }) public currency: string
}
