import { prop } from '../../utils/goosetype'
import { LengthUnit } from '../enums/length-unit'
import { WeightUnit } from '../enums/weight-unit'

export class Units {
    @prop({ enum: WeightUnit }) public weight: WeightUnit
    @prop({ enum: LengthUnit }) public length: LengthUnit
}
