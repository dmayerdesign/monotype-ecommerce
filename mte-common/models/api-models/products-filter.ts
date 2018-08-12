import { prop, schema, MongooseDocument, Ref } from '../../lib/goosetype'
import { ProductsFilter as IProductsFilter } from '../api-interfaces/products-filter'
import { ProductsFilterType } from '../enums/products-filter-type'
import { AttributeValue } from './attribute-value'
import { ProductsFilterDisplayWhen } from './products-filter-display-when'
import { SimpleAttributeValue } from './simple-attribute-value'
import { TaxonomyTerm } from './taxonomy-term'

@schema(ProductsFilter)
export class ProductsFilter extends MongooseDocument implements IProductsFilter {
    @prop({ enum: ProductsFilterType }) public filterType: ProductsFilterType
    @prop() public enabled: boolean
    @prop() public displayAlways?: boolean
    @prop() public displayWhen?: ProductsFilterDisplayWhen
    @prop() public label?: string
    @prop({ itemsRef: TaxonomyTerm }) public taxonomyTermOptions?: Ref<TaxonomyTerm>[]
    @prop({ items: {} }) public attributeValueOptions?: (Ref<AttributeValue> | SimpleAttributeValue)[]
}
