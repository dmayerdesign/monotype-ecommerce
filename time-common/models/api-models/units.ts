import { prop } from 'typegoose'

import { LengthUnit, LengthUnitEnum, WeightUnit, WeightUnitEnum } from '../types'

export class Units {
    @prop({ enum: WeightUnitEnum }) public weight: WeightUnit
    @prop({ enum: LengthUnitEnum }) public length: LengthUnit
}
