import { Price } from '../api-models/price'
import { Product } from '../api-models/product'

export interface ICartProduct {
    quantity: number
    product: Product
    subTotal: Price
}
