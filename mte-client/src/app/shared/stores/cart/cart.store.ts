import { Injectable } from '@angular/core'
import { Store } from '@mte/common/lib/state-manager/store'
import { CartAction } from './cart.actions'
import { cartReducer } from './cart.reducer'
import { CartState } from './cart.state'

@Injectable({ providedIn: 'root' })
export class CartStore extends Store<CartState, CartAction> {
    constructor() {
        super(new CartState(), cartReducer)
    }
}
