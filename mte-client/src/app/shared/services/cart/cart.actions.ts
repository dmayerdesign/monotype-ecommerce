import { Action } from '@mte/common/lib/state-manager/action'
import { Cart } from '@mte/common/models/api-interfaces/cart'
import { Price } from '@mte/common/models/api-interfaces/price'
import { Product } from '@mte/common/models/api-interfaces/product'

export class CartUpdate extends Action<Cart> { }

export class CartItemsUpdate extends Action<Product[]> { }

export class CartItemAddition extends Action<{ item: Product, quantity: number }> { }

export class CartItemQuantityIncrement extends Action<Product> { }

export class CartItemQuantityDecrement extends Action<Product> { }

export class CartItemRemoval extends Action<Product> { }

export class CartTotalUpdate extends Action<Price> { }

export type CartAction =
      CartUpdate
    | CartItemsUpdate
    | CartItemAddition
    | CartItemQuantityIncrement
    | CartItemQuantityDecrement
    | CartItemRemoval
    | CartTotalUpdate
