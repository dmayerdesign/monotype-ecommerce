import { arrayProp, prop, MongooseDocument, Ref } from '../../lib/goosetype'
import { CartProduct } from '../interfaces/ui/cart-product'
import { Discount } from './discount'
import { Product } from './product'

export class Cart extends MongooseDocument<Cart> {
    public displayItems: CartProduct[]
    @prop() public count: number
    @arrayProp({ itemsRef: Product }) public items: Ref<Product>[]
    @prop() public subTotal: number
    @prop() public total: number
    @arrayProp({ itemsRef: Discount }) public discounts: Ref<Discount>[]
}

new Cart().getSchema()
