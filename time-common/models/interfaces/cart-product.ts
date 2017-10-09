import { IPrice } from './price'
import { IProduct } from './product'

export interface ICartProduct {
    quantity: number
    product: IProduct
    subTotal: IPrice
}
