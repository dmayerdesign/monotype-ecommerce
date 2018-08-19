import { arrayProp, schema, MongooseDocument } from '../../lib/goosetype'
import { StoreUiSettings as IStoreUiSettings } from '../api-interfaces/store-ui-settings'
import { ProductsFilter } from './products-filter'

@schema(StoreUiSettings)
export class StoreUiSettings extends MongooseDocument implements IStoreUiSettings {
    @arrayProp({ itemsType: String }) public orderOfVariableAttributeSelects?: string[]
    @arrayProp({ itemsType: [String] }) public combinedVariableAttributeSelects?: string[][]
    @arrayProp({ itemsType: ProductsFilter }) public productsFilters?: ProductsFilter[]
}
