import { createFeatureSelector, select } from '@ngrx/store'
import { AppState } from '../state/app.state'
import { CartState } from './cart.state'

export const cartSelectorKey = 'cart'

export const cartSelector = createFeatureSelector<AppState, CartState>(
    cartSelectorKey
)

export const selectCart = select(cartSelector)
