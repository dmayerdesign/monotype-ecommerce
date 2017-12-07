import { CurrencyEnum } from '../../constants/currency'
import { prop } from '../../utils/goosetype'

export class Price {
    @prop() public total: number
    @prop({ enum: Object.keys(CurrencyEnum) }) public currency: string
}
