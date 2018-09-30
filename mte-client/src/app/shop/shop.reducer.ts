import { cloneDeep } from 'lodash'
import { GetProductsRequestFromRouteUpdate, GetProductsRequestUpdate, ProductsFilterFormsReset, ShopAction, TaxonomyTermInViewUpdate, TaxonomyTermInViewUpdateSuccess } from './shop.actions'
import { ShopState } from './shop.state'

export function shopReducer(state: ShopState, action: ShopAction): ShopState {
    const shopState = cloneDeep(state)

    if (action instanceof GetProductsRequestUpdate) {
        shopState.products.getProductsRequest = action.payload.request
    }

    if (action instanceof GetProductsRequestFromRouteUpdate) {
        shopState.products.getProductsRequestFromRoute = action.payload
    }

    if (action instanceof TaxonomyTermInViewUpdate) {
        if (action.payload === null) {
            shopState.products.taxonomyTerm = null
        }
    }

    if (action instanceof TaxonomyTermInViewUpdateSuccess) {
        shopState.products.taxonomyTerm = action.payload
    }

    if (action instanceof ProductsFilterFormsReset) {
        shopState.products.productsFilterFormBuilders.forEach((productsFilterFormBuilder) =>
            productsFilterFormBuilder.formGroup.reset())
    }

    // After any action is executed, make sure there are no filters without values.

    if (
        shopState.products.getProductsRequest &&
        shopState.products.getProductsRequest.filters
    ) {
        shopState.products.getProductsRequest.filters = shopState.products.getProductsRequest.filters
            .filter((requestFilter) =>
                (requestFilter.values && requestFilter.values.length) ||
                (requestFilter.range)
            )
    }

    return shopState
}
