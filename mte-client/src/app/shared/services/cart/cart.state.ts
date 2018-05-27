import { Ref } from '@mte/common/lib/goosetype'
import { Cart } from '@mte/common/models/api-interfaces/cart'
import { Discount } from '@mte/common/models/api-interfaces/discount'
import { Product } from '@mte/common/models/api-interfaces/product'
import { Currency } from '@mte/common/models/enums/currency'
import { CartProduct } from '@mte/common/models/interfaces/ui/cart-product'

export class CartState implements Cart {
    public count = 0
    public items: Product[] = []
    public displayItems: CartProduct[] = []
    public subTotal = { amount: 0, currency: Currency.USD }
    public total = { amount: 0, currency: Currency.USD }
    public discounts: Discount[] = []
}
