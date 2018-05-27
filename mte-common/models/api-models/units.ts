import { prop, schema, MongooseDocument } from '../../lib/goosetype'
import { LengthUnit } from '../enums/length-unit'
import { WeightUnit } from '../enums/weight-unit'

@schema(Units)
export class Units extends MongooseDocument {
    @prop({ enum: WeightUnit }) public weight: WeightUnit
    @prop({ enum: LengthUnit }) public length: LengthUnit
}
