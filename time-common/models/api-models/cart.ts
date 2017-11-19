import { arrayProp, prop, Ref } from 'typegoose'

import { ICartProduct } from '../interfaces/cart-product'
import { Discount } from './discount'
import { Product } from './product'

export class Cart {
    @prop() public count: number
    @arrayProp({ itemsRef: Product }) public items: Ref<Product>[]
    public displayItems: ICartProduct[]
    @prop() public subTotal: number
    @prop() public total: number
    @arrayProp({ itemsRef: Discount }) public discounts: Ref<Discount>[]
}
