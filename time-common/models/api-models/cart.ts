import { arrayProp, prop, Ref } from 'typegoose'

import { Discount } from './discount'
import { Product } from './product'

export class Cart {
    @prop() public count: number
    @arrayProp({ itemsRef: Product }) public items: Ref<Product>[]
    public displayItems: Product[]
    @prop() public subTotal: number
    @prop() public total: number
    @arrayProp({ itemsRef: Discount }) public discounts: Ref<Discount>[]
}
