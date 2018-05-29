import { values } from 'lodash'
import { arrayProp, schema, MongooseDocument } from '../../lib/goosetype'
import { StoreUiSettings as IStoreUiSettings } from '../api-interfaces/store-ui-settings'

@schema(StoreUiSettings)
export class StoreUiSettings extends MongooseDocument implements IStoreUiSettings {
    @arrayProp({ items: String }) public orderOfVariableAttributeSelects?: string[]
    @arrayProp({ items: [String] }) public combinedVariableAttributeSelects?: string[][]
}
