import { GetProductsRequest } from '@mte/common/api/requests/get-products.request'
import { Stateful } from '@mte/common/models/common/stateful'

export interface GetProductsRequestFromRoute {
    taxonomySlug: string
    taxonomyTermSlug: string
}

export class ProductsState {
    public getProductsRequest? = new GetProductsRequest()
    public getProductsRequestFromRoute?: GetProductsRequestFromRoute = {
        taxonomySlug: null,
        taxonomyTermSlug: null,
    }
}
