import { prop } from 'typegoose'
import { CurrencyEnum } from '../../constants/currency'

export class Price {
    @prop() public total: number
    @prop({ enum: Object.keys(CurrencyEnum) }) public currency: string
}
