import { Cart } from '@mte/common/api/interfaces/cart'
import { CartItem } from '@mte/common/api/interfaces/cart-item'
import { Price } from '@mte/common/api/interfaces/price'
import { Action } from '@mte/common/lib/state-manager/action'

export class CartUpdate extends Action<Cart> { }

export class CartItemsUpdate extends Action<CartItem[]> { }

export class CartItemAddition extends Action<{ item: CartItem, quantity: number }> { }

export class CartItemQuantityIncrement extends Action<CartItem> { }

export class CartItemQuantityDecrement extends Action<CartItem> { }

export class CartItemRemoval extends Action<CartItem> { }

export class CartTotalUpdate extends Action<Price> { }

export type CartAction =
      CartUpdate
    | CartItemsUpdate
    | CartItemAddition
    | CartItemQuantityIncrement
    | CartItemQuantityDecrement
    | CartItemRemoval
    | CartTotalUpdate
