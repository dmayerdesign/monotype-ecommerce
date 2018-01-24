import { Product } from '@time/common/models/api-models/product'

export class StripeCreateProductsOrSkusResponseBody<T> {
    public products: Product[]
    public stripeProductsOrSkus: T[]
}
