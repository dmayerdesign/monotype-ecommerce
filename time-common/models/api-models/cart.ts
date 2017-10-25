import { arrayProp, prop, Ref } from 'typegoose'

import { ICartDocument } from '../interfaces/cart'
import { Discount } from './discount'
import { Product } from './product'

export class Cart {
    @prop() public count: number
    @arrayProp({ itemsRef: Product }) public items: Ref<Product>[]
    @prop() public subTotal: number
    @prop() public total: number
    @arrayProp({ itemsRef: Discount }) public discounts: Ref<Discount>[]
}
