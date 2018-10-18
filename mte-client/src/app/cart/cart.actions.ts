import { Cart } from '@mte/common/api/interfaces/cart'
import { CartItem } from '@mte/common/api/interfaces/cart-item'
import { NgrxAction, NgrxMessage } from '@mte/common/models/ui/ngrx-action'

export abstract class CartAction<PayloadType = any> extends NgrxMessage<PayloadType> { }
export abstract class CartActionSansPayload extends NgrxAction { }

export class CartClear extends CartAction {
    public type = 'Cart Clear'
}

export class CartUpdate extends CartAction<Cart> {
    public type = 'Cart Update'
}

export class CartItemsUpdate extends CartAction<{
  items: CartItem[],
  addSalesTax: boolean,
  salesTaxPercentage: number,
}> {
    public type = 'Cart Items Update'
}

export class CartItemsUpdateSuccess extends CartAction<Cart> {
    public type = 'Cart Items Update Success'
}

export class CartItemAddition extends CartAction<{ item: CartItem, quantity: number }> {
    public type = 'Cart Item Addition'
}

export class CartItemAdditionSuccess extends CartAction<void> {
    public type = 'Cart Item Addition Success'
}

export class CartItemQuantityIncrement extends CartAction<CartItem> {
    public type = 'Cart Item Quantity Increment'
}

export class CartItemQuantityDecrement extends CartAction<CartItem> {
    public type = 'Cart Item Quantity Decrement'
}

export class CartItemRemoval extends CartAction<CartItem> {
    public type = 'Cart Item Removal'
}
