import { Injectable } from '@angular/core'
import { Product } from '@mte/common/api/interfaces/product'
import { GetProductsFilter, GetProductsFilterType, GetProductsRequest } from '@mte/common/api/requests/get-products.request'
import { Actions, Effect } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { debounceTime, filter, map, mergeMap, switchMap, take } from 'rxjs/operators'
import { AppState } from '../state/app.state'
import { ProductsFiltersService } from './services/products-filters.service'
import { TaxonomyTermService } from './services/taxonomy-term.service'
import { GetProductsRequestUpdate, GetProductsSuccess, ShopAction, TaxonomyTermInViewUpdate, TaxonomyTermInViewUpdateSuccess } from './shop.actions'

@Injectable()
export class ShopEffects {

    @Effect()
    public getProductsSuccesses: Observable<GetProductsSuccess> = this._shopActions.pipe(
        filter<GetProductsRequestUpdate>((action) => action instanceof GetProductsRequestUpdate),
        // Make sure that `clearFilters` doesn't trigger multiple requests.
        debounceTime(100),
        switchMap(({ payload }) => {
            const getProductsRequest = payload.request
            const productService = payload.crudService
            let requestedTaxonomyTermFilter: GetProductsFilter
            let requestedTaxonomyTermSlug: string

            this._productsFiltersService.initFiltersShowing()

            // Figure out if we need to fetch taxonomy term data along with the products.
            // (e.g. to display a banner for "Women's")

            if (getProductsRequest) {
                requestedTaxonomyTermFilter = getProductsRequest.filters && getProductsRequest.filters.filter((filter) => filter.type === GetProductsFilterType.TaxonomyTerm).length === 1
                    ? getProductsRequest.filters.find((filter) => filter.type === GetProductsFilterType.TaxonomyTerm)
                    : undefined
            }

            // Get the taxonomy term if ONLY ONE is found in the request.

            requestedTaxonomyTermSlug = requestedTaxonomyTermFilter &&
                requestedTaxonomyTermFilter.values &&
                requestedTaxonomyTermFilter.values.length === 1
                    ? requestedTaxonomyTermFilter.values[0]
                    : undefined
            if (requestedTaxonomyTermSlug) {
                this._store.dispatch(new TaxonomyTermInViewUpdate(requestedTaxonomyTermSlug))
            }
            else {
                this._store.dispatch(new TaxonomyTermInViewUpdate(null))
            }

            // Get products based on the parsed request.

            productService.get(getProductsRequest)
            return productService.getStream.pipe(
                take(1),
                map(() => new GetProductsSuccess())
            )
        })
    )

    @Effect()
    public taxonomyTermInViewUpdateSuccesses = this._shopActions.pipe(
        filter<TaxonomyTermInViewUpdate>((shopAction) => shopAction instanceof TaxonomyTermInViewUpdate),
        mergeMap(({ payload: requestedTaxonomyTermSlug }) =>
            this._taxonomyTermService.getOne(requestedTaxonomyTermSlug).pipe(
                map((taxonomyTerm) => new TaxonomyTermInViewUpdateSuccess(taxonomyTerm))
            ))
    )

    constructor(
        private _shopActions: Actions<ShopAction>,
        private _store: Store<AppState>,
        private _productsFiltersService: ProductsFiltersService,
        private _taxonomyTermService: TaxonomyTermService,
    ) { }
}
