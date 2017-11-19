import { Product } from '@time/common/models/api-models/product'
import { ApiResponse } from '@time/common/models/helpers/api-response'

export interface IStripeCreateProductsOrSkusData<T> {
    products: Product[]
    stripeProductsOrSkus: T[]
}

export class StripeCreateProductsOrSkusResponse<T> extends ApiResponse<IStripeCreateProductsOrSkusData<T>> { }
