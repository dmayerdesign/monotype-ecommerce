import { MongooseDocument } from '../../lib/goosetype'

export interface StoreUiSettings extends MongooseDocument {
    orderOfVariableAttributeSelects?: string[]
    combinedVariableAttributeSelects?: string[][]
}
