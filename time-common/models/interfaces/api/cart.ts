import { Document } from 'mongoose'

import { Product } from '../../api-models/product'
import { ICartProduct } from '../ui/cart-product'

export interface ICart {
    count: number
    items: Product[]
    displayItems?: ICartProduct[],
    subTotal: number
    total: number
    discounts: string[]
}

export interface ICartDocument extends ICart, Document { }

