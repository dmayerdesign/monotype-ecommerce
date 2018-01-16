import { arrayProp, prop, Ref } from '../../lib/goosetype'
import { ICartProduct } from '../interfaces/ui/cart-product'
import { Discount } from './discount'
import { Product } from './product'

export class Cart {
    public displayItems: ICartProduct[]
    @prop() public count: number
    @arrayProp({ itemsRef: Product }) public items: Ref<Product>[]
    @prop() public subTotal: number
    @prop() public total: number
    @arrayProp({ itemsRef: Discount }) public discounts: Ref<Discount>[]
}
