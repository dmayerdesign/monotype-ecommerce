import { Cart } from '@mte/common/api/interfaces/cart'
import { CartItem } from '@mte/common/api/interfaces/cart-item'
import { Product } from '@mte/common/api/interfaces/product'
import { CartHelper } from '@mte/common/helpers/cart.helper'
import { cloneDeep } from 'lodash'
import { CartAction, CartClear, CartItemsUpdate, CartItemAddition, CartItemQuantityDecrement, CartItemQuantityIncrement, CartItemRemoval, CartUpdate } from './cart.actions'
import { initialCartState, CartState } from './cart.state'

export function cartReducer(state: CartState, action: CartAction): CartState {
    let cart = cloneDeep(state)

    // Clear cart.

    if (action instanceof CartClear) {
        cart = initialCartState
    }

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
        const { items, addSalesTax, salesTaxPercentage } = action.payload
        const subTotal = CartHelper.getSubTotal(items)
        const total = CartHelper.getTotal(subTotal, addSalesTax, salesTaxPercentage)
        cart = {
            ...cart,
            items,
            subTotal,
            total,
        }
    }

    // Add item.

    if (action instanceof CartItemAddition) {
        const { item, quantity } = action.payload
        const itemsAvailable = CartHelper.getNumberAvailableToAdd(cart as Cart, item)
        const amtToAdd = itemsAvailable >= quantity ? quantity : itemsAvailable
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
        const index = cart.items.findIndex((i: CartItem) => i.slug === item.slug)
        if (index > -1) {
            cart.items.splice(index, 1)
        } else {
            throw new Error()
        }
    }

    // Remove item.
    if (action instanceof CartItemRemoval) {
        const item = action.payload
        while (cart.items.findIndex((i: CartItem) => i.slug === item.slug) > -1) {
            cart.items.splice(cart.items.findIndex((i: CartItem) => i.slug === item.slug), 1)
        }
    }

    cart.count = cart.items.length
    cart.subTotal = CartHelper.getSubTotal(cart.items as Product[])
    cart.displayItems = CartHelper.getDisplayItems(cart.items as Product[])

    return cart
}
