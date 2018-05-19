import { ProductHelper } from '@mte/common/helpers/product.helper'
import { Cart } from '@mte/common/models/api-models/cart'
import { Price } from '@mte/common/models/api-models/price'
import { Product } from '@mte/common/models/api-models/product'
import { Currency } from '@mte/common/models/enums/currency'
import { CartProduct } from '@mte/common/models/interfaces/ui/cart-product'

export class CartHelper {
    public static getDisplayItems(items: Product[]): CartProduct[] {
        const displayItems: CartProduct[] = []

        items.forEach(item => {
            const duplicateItemIndex = displayItems.findIndex(displayItem => displayItem.product._id === item._id)

            if (duplicateItemIndex > -1) {
                const duplicateItem = displayItems.find(displayItem => displayItem.product._id === item._id)

                displayItems[duplicateItemIndex] = {
                    ...duplicateItem,
                    quantity: duplicateItem.quantity + 1,
                    subTotal: {
                        amount: duplicateItem.subTotal.amount + (ProductHelper.getPrice(item) as Price).amount,
                        currency: duplicateItem.subTotal.currency,
                    } as Price,
                }
            }
            else {
                displayItems.push({
                    quantity: 1,
                    product: item,
                    subTotal: ProductHelper.getPrice(item) as Price,
                })
            }
        })

        return displayItems
    }

    public static getSubTotal(items: Product[]): Price {
        return items
            .map((p) => {
                return (ProductHelper.getPrice(p) as Price)
            })
            .reduce((prev: Price, current: Price) => {
                return {
                    currency: current.currency,
                    amount: prev.amount + current.amount
                }
            }, { amount: 0, currency: Currency.USD })
    }

    public static getNumberAvailableToAdd(cart: Cart, product: Product): number {
        return product.stockQuantity - cart.items.filter((item: Product) => item._id === product._id).length
    }
}
