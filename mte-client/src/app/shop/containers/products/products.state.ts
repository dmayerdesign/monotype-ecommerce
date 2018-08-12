import { GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { Stateful } from '@mte/common/models/common/stateful'

export class ProductsState {
    public getProductsRequest? = new GetProductsRequest()
    public getProductsRequestFromRoute? = {
        taxonomySlug: null as string,
        taxonomyTermSlug: null as string,
    }
}

export class ProductsStateManager extends Stateful<ProductsState> {
    protected _state = new ProductsState()

    public setState(newState: ProductsState): void {
        if (
            newState.getProductsRequest &&
            newState.getProductsRequest.filters
        ) {
            newState.getProductsRequest.filters = newState.getProductsRequest.filters.filter((requestFilter) =>
                requestFilter.values && requestFilter.values.length)
        }
        super.setState(newState)
    }
}
