import { ApiResponse } from '@time/common/models/api-responses/api.response'
import { StripeCreateProductsOrSkusResponseBody } from './stripe-create-products-or-skus.response.body'

export class StripeCreateProductsOrSkusResponse<T> extends ApiResponse<StripeCreateProductsOrSkusResponseBody<T>> { }
