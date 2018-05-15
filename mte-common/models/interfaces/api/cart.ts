import { Document } from 'mongoose'
import { Product } from '../../api-models/product'
import { CartProduct } from '../ui/cart-product'

export interface Cart {
    count: number
    items: Product[]
    displayItems: CartProduct[]
    subTotal: number
    total: number
    discounts: string[]
}

export interface CartDocument extends Cart, Document { }

