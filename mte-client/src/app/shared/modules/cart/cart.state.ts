import { Cart } from '@mte/common/api/interfaces/cart'
import { Product } from '@mte/common/api/interfaces/product'
import { Currency } from '@mte/common/constants/enums/currency'
import { CartDisplayItem } from '@mte/common/models/ui/cart-display-item'

export interface CartState extends Cart {
    displayItems: CartDisplayItem<Product>[]
}

export const initialCartState: CartState = {
    count: 0,
    items: [],
    displayItems: [],
    subTotal: { amount: 0, currency: Currency.USD },
    total: { amount: 0, currency: Currency.USD },
    discounts: [],
}
