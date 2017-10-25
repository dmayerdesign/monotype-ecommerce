import { Document } from 'mongoose'

import { ICartProduct } from './cart-product'
import { IDiscount } from './discount'
import { IProduct } from './product'

export interface ICart {
    count: number
    items: IProduct[]
    displayItems?: ICartProduct[],
    subTotal: number
    total: number
    discounts: string[]
}

export interface ICartDocument extends ICart, Document { }

