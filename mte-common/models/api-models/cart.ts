import { arrayProp, prop, schema, MongooseDocument, Ref } from '../../lib/goosetype'
import { CartProduct } from '../interfaces/ui/cart-product'
import { Discount } from './discount'
import { Price } from './price'
import { Product } from './product'

@schema(Cart)
export class Cart extends MongooseDocument {
    @prop() public count?: number
    @arrayProp({ itemsRef: Product }) public items: Ref<Product>[]
    @prop() public subTotal: Price
    @prop() public total: Price
    @arrayProp({ itemsRef: Discount }) public discounts?: Ref<Discount>[]
}
