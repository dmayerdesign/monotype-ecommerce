import { prop } from '../../utils/goosetype'

import { LengthUnit, LengthUnitEnum, WeightUnit, WeightUnitEnum } from '../types'

export class Units {
    @prop({ enum: Object.keys(WeightUnitEnum) }) public weight: WeightUnit
    @prop({ enum: Object.keys(LengthUnitEnum) }) public length: LengthUnit
}
