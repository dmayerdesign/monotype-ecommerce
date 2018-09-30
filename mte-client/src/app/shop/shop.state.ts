import { TaxonomyTerm } from '@mte/common/api/entities/taxonomy-term'
import { GetProductsRequest } from '@mte/common/api/requests/get-products.request'
import { MteFormBuilder } from '@mte/common/lib/ng-modules/forms/utilities/form.builder'

export interface GetProductsRequestFromRoute {
    taxonomySlug: string
    taxonomyTermSlug: string
}

export interface ProductsState {
    getProductsRequest: GetProductsRequest
    getProductsRequestFromRoute: GetProductsRequestFromRoute
    productsFilterFormBuilders: MteFormBuilder[]
    taxonomyTerm: TaxonomyTerm
}

export interface ShopState {
    products: ProductsState
}

export const initialShopState: ShopState = {
    products: {
        getProductsRequest: new GetProductsRequest(),
        getProductsRequestFromRoute: {
            taxonomySlug: null,
            taxonomyTermSlug: null,
        },
        productsFilterFormBuilders: [],
        taxonomyTerm: null,
    }
}
