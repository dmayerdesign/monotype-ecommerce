import { CartProduct } from '../interfaces/ui/cart-product'
import { Discount } from './discount'
import { MongooseDocument } from './mongoose-document'
import { Price } from './price'
import { Product } from './product'
import { Ref } from './ref'

export interface Cart extends MongooseDocument {
    count?: number
    items: Ref<Product>[]
    subTotal: Price
    total: Price
    discounts?: Ref<Discount>[]
}
