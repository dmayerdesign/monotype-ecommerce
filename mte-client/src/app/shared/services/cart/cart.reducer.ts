import { CartHelper } from '@mte/common/helpers/cart.helper'
import { Action } from '@mte/common/lib/state-manager/action'
import { Cart } from '@mte/common/models/api-interfaces/cart'
import { Product } from '@mte/common/models/api-interfaces/product'
import { cloneDeep } from 'lodash'
import { CartAction, CartItemsUpdate, CartItemAddition, CartItemQuantityDecrement, CartItemQuantityIncrement, CartItemRemoval, CartUpdate, CartTotalUpdate } from './cart.actions'
import { CartState } from './cart.state'

export function cartReducer(state: CartState, action: CartAction): CartState {
    let cart = cloneDeep(state)

    // Update cart.
    if (action instanceof CartUpdate) {
        const payload = action.payload as CartState
        cart = {
            ...cart,
            ...payload,
        }
    }

    // Update items.
    if (action instanceof CartItemsUpdate) {
        const payload = action.payload
        cart = {
            ...cart,
            items: payload
        }
    }

    // Add item.
    if (action instanceof CartItemAddition) {
        const { item, quantity } = action.payload
        const productsAvailable = CartHelper.getNumberAvailableToAdd(cart as Cart, item)
        const amtToAdd = productsAvailable >= quantity ? quantity : productsAvailable
        for (let i = 0; i < amtToAdd; i++) {
            cart.items.push(item)
        }
    }

    if (action instanceof CartItemQuantityIncrement) {
        const item = action.payload
        const numberAvailable = CartHelper.getNumberAvailableToAdd(cart as Cart, item)
        if (!!numberAvailable) {
            cart.items.push(item)
        } else {
            throw new Error()
        }
    }

    if (action instanceof CartItemQuantityDecrement) {
        const item = action.payload
        const index = cart.items.findIndex((i: Product) => i.slug === item.slug)
        if (index > -1) {
            cart.items.splice(index, 1)
        } else {
            throw new Error()
        }
    }

    // Remove item.
    if (action instanceof CartItemRemoval) {
        const item = action.payload
        while (cart.items.findIndex((i: Product) => i.slug === item.slug) > -1) {
            cart.items.splice(cart.items.findIndex((i: Product) => i.slug === item.slug), 1)
        }
    }

    // Update the total.
    if (action instanceof CartTotalUpdate) {
        cart.total = action.payload
    }

    cart.count = cart.items.length
    cart.subTotal = CartHelper.getSubTotal(cart.items)
    cart.displayItems = CartHelper.getDisplayItems(cart.items)

    return cart
}
