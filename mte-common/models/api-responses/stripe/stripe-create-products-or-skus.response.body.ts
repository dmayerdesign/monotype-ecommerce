import { Product } from '@mte/common/models/api-models/product'

export class StripeCreateProductsOrSkusResponseBody<T> {
    public products: Product[]
    public stripeProductsOrSkus: T[]
}
