import { Document } from 'mongoose'
import { Discount } from '../../api-models/discount'
import { Price } from '../../api-models/price'
import { Product } from '../../api-models/product'
import { CartProduct } from '../ui/cart-product'

export interface Cart {
    count: number
    items: Product[]
    displayItems: CartProduct[]
    subTotal: Price
    total: Price
    discounts: Discount[]
}

export interface CartDocument extends Cart, Document { }

