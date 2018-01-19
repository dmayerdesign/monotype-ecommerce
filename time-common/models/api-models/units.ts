import { prop, MongooseDocument } from '../../lib/goosetype'
import { LengthUnit } from '../enums/length-unit'
import { WeightUnit } from '../enums/weight-unit'

export class Units extends MongooseDocument<Units> {
    @prop({ enum: WeightUnit }) public weight: WeightUnit
    @prop({ enum: LengthUnit }) public length: LengthUnit
}
new Units().getSchema()
