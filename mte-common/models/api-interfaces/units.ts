import { LengthUnit } from '../enums/length-unit'
import { WeightUnit } from '../enums/weight-unit'
import { MongooseDocument } from './mongoose-document'

export interface Units extends MongooseDocument {
    weight: WeightUnit
    length: LengthUnit
}
