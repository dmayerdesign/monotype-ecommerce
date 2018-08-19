import { cloneDeep } from 'lodash'
import { GetProductsRequestFromRouteUpdate, GetProductsRequestUpdate, ProductsAction } from './products.actions'
import { ProductsState } from './products.state'

export function productsReducer(state: ProductsState, action: ProductsAction): ProductsState {
    const productsState = cloneDeep(state)

    if (action instanceof GetProductsRequestUpdate) {
        productsState.getProductsRequest = action.payload
    }

    if (action instanceof GetProductsRequestFromRouteUpdate) {
        productsState.getProductsRequestFromRoute = action.payload
    }

    // After any action is executed, make sure there are no filters without values..

    if (
        productsState.getProductsRequest &&
        productsState.getProductsRequest.filters
    ) {
        productsState.getProductsRequest.filters = productsState.getProductsRequest.filters
            .filter((requestFilter) =>
                (requestFilter.values && requestFilter.values.length) ||
                (requestFilter.range)
            )
    }

    return productsState
}
