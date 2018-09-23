import { Cart } from '@mte/common/api/interfaces/cart'
import { CartItem } from '@mte/common/api/interfaces/cart-item'
import { Action } from '@mte/common/lib/state-manager/action'

export class CartUpdate extends Action<Cart> { }

export class CartItemsUpdate extends Action<{
  items: CartItem[],
  addSalesTax: boolean,
  salesTaxPercentage: number,
}> { }

export class CartItemAddition extends Action<{ item: CartItem, quantity: number }> { }

export class CartItemQuantityIncrement extends Action<CartItem> { }

export class CartItemQuantityDecrement extends Action<CartItem> { }

export class CartItemRemoval extends Action<CartItem> { }

export type CartAction =
      CartUpdate
    | CartItemsUpdate
    | CartItemAddition
    | CartItemQuantityIncrement
    | CartItemQuantityDecrement
    | CartItemRemoval
