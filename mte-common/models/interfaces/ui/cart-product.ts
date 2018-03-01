import { Price } from '../../api-models/price'
import { Product } from '../../api-models/product'

export interface CartProduct {
    quantity: number
    product: Product
    subTotal: Price
}
