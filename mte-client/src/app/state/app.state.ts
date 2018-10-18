import { CartState } from '../cart/cart.state'
import { ShopState } from '../shop/shop.state'

export interface AppState {
    cart: CartState
    shop: ShopState
}
