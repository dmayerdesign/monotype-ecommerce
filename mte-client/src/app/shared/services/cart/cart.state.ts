import { Cart } from '@mte/common/api/interfaces/cart'
import { Discount } from '@mte/common/api/interfaces/discount'
import { Product } from '@mte/common/api/interfaces/product'
import { Currency } from '@mte/common/constants/enums/currency'
import { CartDisplayItem } from '@mte/common/models/ui/cart-display-item'

export class CartState implements Cart {
    public count = 0
    public items: Product[] = []
    public displayItems: CartDisplayItem<Product>[] = []
    public subTotal = { amount: 0, currency: Currency.USD }
    public total = { amount: 0, currency: Currency.USD }
    public discounts: Discount[] = []
}
