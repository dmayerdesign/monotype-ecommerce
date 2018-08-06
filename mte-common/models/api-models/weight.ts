import { prop, schema, MongooseDocument } from '../../lib/goosetype'
import { WeightUnit } from '../enums/weight-unit'

@schema(Weight, { _id: false })
export class Weight extends MongooseDocument {
    @prop() public amount: number
    @prop({ enum: WeightUnit, type: String }) public unitOfMeasurement: WeightUnit
}
