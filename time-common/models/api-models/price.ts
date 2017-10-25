import { prop } from 'typegoose'
import { CurrencyEnum } from '../../constants/currency'

export class Price {
    @prop() public total: number
    @prop({ enum: CurrencyEnum }) public currency: CurrencyEnum
}
