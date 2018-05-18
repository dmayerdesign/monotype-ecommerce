import { Ref } from '@mte/common/lib/goosetype'
import { Discount } from '@mte/common/models/api-models/discount'
import { Product } from '@mte/common/models/api-models/product'
import { Currency } from '@mte/common/models/enums/currency'
import { Cart } from '@mte/common/models/interfaces/api/cart'
import { CartProduct } from '@mte/common/models/interfaces/ui/cart-product'

export class CartState implements Cart {
    public count = 0
    public items: Product[] = []
    public displayItems: CartProduct[] = []
    public subTotal = { amount: 0, currency: Currency.USD }
    public total = { amount: 0, currency: Currency.USD }
    public discounts: Discount[] = []
}
