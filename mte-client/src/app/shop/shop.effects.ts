import { Injectable } from '@angular/core'
import { GetProductsFilter, GetProductsFilterType } from '@mte/common/api/requests/get-products.request'
import { Actions, Effect } from '@ngrx/effects'
import { of as observableOf, Observable } from 'rxjs'
import { debounceTime, filter, map, mergeMap, switchMap, take, takeWhile, tap } from 'rxjs/operators'
import { ProductsFiltersService } from './services/products-filters.service'
import { TaxonomyTermService } from './services/taxonomy-term.service'
import { filterByType, GetProductsRequestUpdate, GetProductsSuccess, ProductsFilterFormBuildersUpdate, ShopAction, TaxonomyTermInViewUpdate, TaxonomyTermInViewUpdateSuccess } from './shop.actions'

@Injectable()
export class ShopEffects {

    @Effect()
    public getProductsSuccesses: Observable<GetProductsSuccess> = this._shopActions.pipe(
        filterByType<GetProductsRequestUpdate>(GetProductsRequestUpdate),
        // Make sure that `clearFilters` doesn't trigger multiple requests.
        debounceTime(100),
        switchMap((action) => {
            const payload = action.payload
            const getProductsRequest = payload.request
            const productService = payload.crudService

            // Get products based on the parsed request.

            productService.get(getProductsRequest)
            return productService.getStream.pipe(
                take(1),
                map(() => new GetProductsSuccess())
            )
        })
    )

    @Effect()
    public productsFilterFormBuildersUpdates: Observable<ProductsFilterFormBuildersUpdate> = this._shopActions.pipe(
        filterByType<GetProductsRequestUpdate>(GetProductsRequestUpdate),
        // Make sure that `clearFilters` doesn't trigger multiple requests.
        debounceTime(100),
        map(({ payload: { request: getProductsRequest } }) => new ProductsFilterFormBuildersUpdate(
            this._productsFilterService.getFiltersForRequest(getProductsRequest)
        ))
    )

    @Effect()
    public taxonomyTermInViewUpdates: Observable<TaxonomyTermInViewUpdate> = this._shopActions.pipe(
        filterByType<GetProductsRequestUpdate>(GetProductsRequestUpdate),
        // Make sure that `clearFilters` doesn't trigger multiple requests.
        debounceTime(100),
        map(({ payload: { request: getProductsRequest } }) => {
            let requestedTaxonomyTermFilter: GetProductsFilter

            // Figure out if we need to fetch taxonomy term data along with the products.
            // (e.g. to display a banner for "Women's")

            if (getProductsRequest) {
                requestedTaxonomyTermFilter = getProductsRequest.filters && getProductsRequest.filters.filter((filter) => filter.type === GetProductsFilterType.TaxonomyTerm).length === 1
                    ? getProductsRequest.filters.find((filter) => filter.type === GetProductsFilterType.TaxonomyTerm)
                    : undefined
            }

            // Get the taxonomy term if ONLY ONE is found in the request.

            const requestedTaxonomyTermSlug = requestedTaxonomyTermFilter &&
                requestedTaxonomyTermFilter.values &&
                requestedTaxonomyTermFilter.values.length === 1
                    ? requestedTaxonomyTermFilter.values[0]
                    : undefined
            if (requestedTaxonomyTermSlug) {
                return new TaxonomyTermInViewUpdate(requestedTaxonomyTermSlug)
            }
            else {
                return new TaxonomyTermInViewUpdate(null)
            }
        })
    )

    @Effect()
    public taxonomyTermInViewUpdateSuccesses = this._shopActions.pipe(
        filterByType<TaxonomyTermInViewUpdate>(TaxonomyTermInViewUpdate),
        mergeMap(({ payload: requestedTaxonomyTermSlug }) => {
            if (requestedTaxonomyTermSlug) {
                return this._taxonomyTermService.getOne(requestedTaxonomyTermSlug).pipe(
                    map((taxonomyTerm) => new TaxonomyTermInViewUpdateSuccess(taxonomyTerm))
                )
            }
            return observableOf(new TaxonomyTermInViewUpdateSuccess(null))
        })
    )

    @Effect()
    public getProductsRequestUpdates = this._shopActions.pipe(
        filterByType<ProductsFilterFormBuildersUpdate>(ProductsFilterFormBuildersUpdate),
        mergeMap(({ payload: mteFormBuilder }) => {
            return mteFormBuilder.formGroup.valueChanges
                .pipe(
                    // takeWhile(() => {}),
                    filter((formValue) => !isEqual(
                        formValue,
                        this._productsFilterFormValuesMap.get(productsFilter),
                    )),
                    tap(async (formValue) => {
                        const formGroupOptions = this._formGroupOptionsFactoryMap
                            .get(mteFormBuilder.data.productsFilter.filterType)(productsFilter)
                        const existingFilterFinder = this._existingFilterFinderMap
                            .get(mteFormBuilder.data.productsFilter.filterType)
                        const newRequestFilterFactory = this._newRequestFilterFactoryMap
                            .get(mteFormBuilder.data.productsFilter.filterType)
                        this._productsFilterFormValuesMap.set(productsFilter, formValue)

                        const request = await this._store
                            .pipe(
                                selectProducts,
                                take(1),
                                map((productsState) => productsState.getProductsRequest)
                            )
                            .toPromise()

                        const newRequestFilters = !!request.filters
                            ? [ ...request.filters ]
                            : []
                        const newRequest = {
                            ...request,
                            filters: newRequestFilters
                        }

                        if (typeof existingFilterFinder === 'function') {
                            const indexOfExistingFilter = newRequestFilters
                                .findIndex(existingFilterFinder(productsFilter))
                            if (indexOfExistingFilter > -1) {
                                newRequestFilters.splice(indexOfExistingFilter, 1)
                            }
                        }

                        if (typeof newRequestFilterFactory === 'function') {
                            newRequestFilters.push(newRequestFilterFactory(formValue))
                        }

                        return new GetProductsRequestUpdate({
                            request: newRequest,
                            crudService: this._productService,
                            filtersService: this,
                        })
                    })
                )
        })
    )

    constructor(
        private _shopActions: Actions<ShopAction>,
        private _productsFilterService: ProductsFiltersService,
        private _taxonomyTermService: TaxonomyTermService,
    ) { }
}
