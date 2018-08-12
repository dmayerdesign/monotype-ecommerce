import { prop, schema, MongooseDocument } from '../../lib/goosetype'
import { ProductsFilterDisplayWhen as IProductsFilterDisplayWhen } from '../api-interfaces/products-filter-display-when'

@schema(ProductsFilterDisplayWhen)
export class ProductsFilterDisplayWhen extends MongooseDocument implements IProductsFilterDisplayWhen {
    @prop() public taxonomyTerm: string
}
