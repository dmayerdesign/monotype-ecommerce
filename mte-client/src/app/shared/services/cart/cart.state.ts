import { Cart } from '@mte/common/models/api-interfaces/cart'
import { Discount } from '@mte/common/models/api-interfaces/discount'
import { Product } from '@mte/common/models/api-interfaces/product'
import { Currency } from '@mte/common/models/enums/currency'
import { CartDisplayItem } from '@mte/common/models/interfaces/ui/cart-display-item'

export class CartState implements Cart {
    public count = 0
    public items: Product[] = []
    public displayItems: CartDisplayItem<Product>[] = []
    public subTotal = { amount: 0, currency: Currency.USD }
    public total = { amount: 0, currency: Currency.USD }
    public discounts: Discount[] = []
}
