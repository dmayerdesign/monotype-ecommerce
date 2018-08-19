import { CartItem } from '../../api-interfaces/cart-item'
import { Price } from '../../api-models/price'

export interface CartDisplayItem<ItemType extends CartItem> {
    quantity: number
    subTotal: Price
    data: ItemType
}
