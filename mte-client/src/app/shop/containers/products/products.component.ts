import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { Attribute } from '@mte/common/api/interfaces/attribute'
import { AttributeValue } from '@mte/common/api/interfaces/attribute-value'
import { Price } from '@mte/common/api/interfaces/price'
import { Product } from '@mte/common/api/interfaces/product'
import { ProductsFilter } from '@mte/common/api/interfaces/products-filter'
import { Taxonomy } from '@mte/common/api/interfaces/taxonomy'
import { TaxonomyTerm } from '@mte/common/api/interfaces/taxonomy-term'
import { GetProductsFilter, GetProductsFilterType, GetProductsRequest } from '@mte/common/api/requests/get-products.request'
import { BootstrapBreakpointKey } from '@mte/common/constants/enums/bootstrap-breakpoint-key'
import { ProductsFilterType } from '@mte/common/constants/enums/products-filter-type'
import { RangeLimit } from '@mte/common/constants/enums/range-limit'
import { MongooseHelper as mh } from '@mte/common/helpers/mongoose.helper'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { MteFormGroupOptions } from '@mte/common/lib/ng-modules/forms/models/form-group-options'
import { MteFormBuilderService } from '@mte/common/lib/ng-modules/forms/services/form-builder.service'
import { MteFormBuilder } from '@mte/common/lib/ng-modules/forms/utilities/form.builder'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import { Store } from '@mte/common/lib/state-manager/store'
import { camelCase, isEqual, kebabCase, uniqWith } from 'lodash'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { debounceTime, filter, map, take, takeUntil, takeWhile, tap } from 'rxjs/operators'
import { OrganizationService } from '../../../shared/services/organization.service'
import { ShopQueryParamKeys } from '../../constants/shop-query-param-keys'
import { ShopRouterLinks } from '../../constants/shop-router-links'
import { ProductService } from '../../services/product.service'
import { TaxonomyTermService } from '../../services/taxonomy-term.service'
import { GetProductsRequestFromRouteUpdate, GetProductsRequestUpdate } from './products.actions'
import { productsReducer } from './products.reducer'
import { ProductsState } from './products.state'

export interface ProductsFilterFormData {
    taxonomy?: Taxonomy
    attribute?: Attribute
    productsFilter?: ProductsFilter
}

@Component({
    selector: 'mte-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss'],
    providers: [
        ProductService,
    ],
})
@Heartbeat()
export class ProductsComponent extends HeartbeatComponent implements OnInit, OnDestroy {
    @Input() public title: string
    public productsStream: Observable<Product[]>
    public priceRange: Price[]
    public taxonomyTerm: TaxonomyTerm
    public leftSidebarIsExpandeds: BehaviorSubject<boolean>
    public store = new Store<ProductsState>(new ProductsState(), productsReducer)
    public productsFilterFormBuilders: MteFormBuilder[]
    public rangeLimit = RangeLimit
    private _productsFilterFormBuilders: MteFormBuilder[]
    private _productsFilterFormValuesMap = new Map<ProductsFilter, any>()
    private _shouldExecuteRequestOnFormValueChanges = false
    private _existingFilterFinderMap = new Map<
        ProductsFilterType,
        (productsFilter?: ProductsFilter) => (getProductsFilter: GetProductsFilter) => boolean
    >()
    private _formGroupOptionsFactoryMap = new Map<
        ProductsFilterType,
        (productsFilter?: ProductsFilter) => MteFormGroupOptions
    >()
    private _newRequestFilterFactoryMap = new Map<ProductsFilterType, (formValue: any) => GetProductsFilter>()

    constructor(
        public windowRef: WindowRefService,
        private _productService: ProductService,
        private _taxonomyTermService: TaxonomyTermService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _mteFormBuilderService: MteFormBuilderService,
        private _organizationService: OrganizationService
    ) { super() }

    public ngOnInit(): void {

        // Expand the left sidebar if the screen width is large or above.

        this.leftSidebarIsExpandeds = new BehaviorSubject(
            this.windowRef.mediaBreakpointAbove(BootstrapBreakpointKey.Lg)
        )

        // Execute the request any time it changes.

        this.store.reactTo.oneOf(GetProductsRequestUpdate)
            .pipe(
                // Make sure that `clearFilters` doesn't trigger multiple requests.
                debounceTime(100),
                // Drill down to the `GetProductsRequest`.
                map(() => this.store.state.getProductsRequest)
            )
            .subscribe((getProductsRequest) => {
                this._initFiltersShowing()
                this.executeRequest(getProductsRequest)
            })

        this._productService.getPriceRange()
            .then((priceRange) => {
                this._updateFormSilently(() => {
                    this.priceRange = priceRange
                    const priceRangeFormBuilder = this._productsFilterFormBuilders.find((mteFormBuilder) =>
                        !!mteFormBuilder.formGroup.get('priceRange'))
                    priceRangeFormBuilder.formGroup.get('priceRange').setValue(
                        this.priceRange.map((price) => price.amount)
                    )
                })
            })

        // Construct a new request when the query params change.
        // TODO: Expose this functionality to the user by allowing them to copy a link to
        // whatever particular search/filter they have going on (to bookmark or share).
        // By default, no request data will be shown in the URL.

        this._activatedRoute.queryParamMap
            .pipe(takeWhile(() => this.isAlive))
            .subscribe((queryParamMap) => {
                const paramMap = this._activatedRoute.snapshot.paramMap

                let newRequest: GetProductsRequest
                newRequest = this._createRequestFromQueryParamMap(queryParamMap)
                newRequest = this._mutateRequestFromRouteParamMap(newRequest, paramMap)

                if (newRequest) {
                    this.store.dispatch(new GetProductsRequestUpdate(newRequest))
                }
            })

        // Mutate the request when the route params change.

        this._activatedRoute.paramMap
            .pipe(takeWhile(() => this.isAlive))
            .subscribe((paramMap) => {
                const getProductsRequest = this._mutateRequestFromRouteParamMap(
                    this.store.state.getProductsRequest,
                    paramMap
                )
                this.store.dispatch(new GetProductsRequestUpdate(getProductsRequest))
            })

        // Register handler functions to handle value changes to the filter forms.

        // ...for `TaxonomyTermChecklist`s.

        this._registerExistingFilterFinder(ProductsFilterType.TaxonomyTermChecklist,
            (productsFilter) =>
                (getProductsFilter) =>
                    getProductsFilter.values && getProductsFilter.values.some((filterValue) =>
                        productsFilter.taxonomyTermOptions.some((taxonomyTerm: TaxonomyTerm) =>
                            filterValue === taxonomyTerm.slug)))
        this._registerFormGroupOptionsFactory(ProductsFilterType.TaxonomyTermChecklist,
            (productsFilter) => {
                const formGroupOptions: MteFormGroupOptions = {}
                productsFilter.taxonomyTermOptions.forEach((taxonomyTerm: TaxonomyTerm) => {
                    formGroupOptions[camelCase(taxonomyTerm.slug)] = {
                        defaultValue: false,
                        label: taxonomyTerm.singularName || taxonomyTerm.slug,
                        formControlType: 'checkbox',
                    }
                })
                return formGroupOptions
            })
        this._registerNewRequestFilterFactory(ProductsFilterType.TaxonomyTermChecklist, (formValue) => {
            return {
                type: GetProductsFilterType.TaxonomyTerm,
                values: Object.keys(formValue)
                    .filter((key) => !!formValue[key])
                    .map((key) => kebabCase(key))
            }
        })

        // ...for `AttributeValueChecklist`s.

        this._registerExistingFilterFinder(ProductsFilterType.AttributeValueChecklist,
            (productsFilter) =>
                (getProductsFilter) =>
                    getProductsFilter.values && getProductsFilter.values.some((filterValue) =>
                        productsFilter.attributeValueOptions.some((attributeValue: AttributeValue) =>
                            filterValue === attributeValue.slug)))
        this._registerFormGroupOptionsFactory(ProductsFilterType.AttributeValueChecklist,
            (productsFilter) => {
                const formGroupOptions: MteFormGroupOptions = {}
                productsFilter.attributeValueOptions.forEach((attributeValue: AttributeValue) => {
                    formGroupOptions[camelCase(attributeValue.slug)] = {
                        defaultValue: false,
                        label: attributeValue.name || attributeValue.slug,
                        formControlType: 'checkbox',
                    }
                })
                return formGroupOptions
            })
        this._registerNewRequestFilterFactory(ProductsFilterType.AttributeValueChecklist, (formValue) => {
            return {
                type: GetProductsFilterType.AttributeValue,
                values: Object.keys(formValue)
                    .filter((key) => !!formValue[key])
                    .map((key) => kebabCase(key))
            }
        })

        // ...for `PriceRange`.

        this._registerExistingFilterFinder(ProductsFilterType.PriceRange,
            () =>
                (getProductsFilter) =>
                    getProductsFilter.type === GetProductsFilterType.Property &&
                    !!getProductsFilter.range &&
                    getProductsFilter.key === 'price')
        this._registerFormGroupOptionsFactory(ProductsFilterType.PriceRange, () => {
            const formGroupOptions: MteFormGroupOptions = {}
            formGroupOptions.priceRange = {
                label: 'Price range',
                formControlType: 'input',
                defaultValue: [0, 1000]
            }
            return formGroupOptions
        })
        this._registerNewRequestFilterFactory(ProductsFilterType.PriceRange, (formValue) => {
            return {
                type: GetProductsFilterType.Property,
                key: 'price',
                range: formValue.priceRange
            }
        })

        // Now, set up the filters.
        this._initFilters()
        this._initFiltersShowing()
    }

    private _initFiltersShowing(): void {
        this.productsFilterFormBuilders = this._productsFilterFormBuilders
            .filter((formBuilder) =>
                this._shouldDisplayProductsFilter(formBuilder.data.productsFilter))
    }

    private _initFilters(): void {
        const { storeUiSettings } = this._organizationService.organization

        this._productsFilterFormBuilders = mh.toArray<ProductsFilter>(storeUiSettings.productsFilters)
            .filter((productsFilter) => productsFilter.enabled)
            .map((productsFilter) => {
                let mteFormBuilder: MteFormBuilder<ProductsFilterFormData>
                let existingFilterFinder: (productsFilter?: ProductsFilter) =>
                    (getProductsFilter: GetProductsFilter) => boolean
                let newRequestFilterFactory: (formValue: any) => GetProductsFilter
                let formGroupOptions: MteFormGroupOptions
                let taxonomy: Taxonomy
                let attribute: Attribute

                if (
                    productsFilter.filterType === ProductsFilterType.TaxonomyTermChecklist &&
                    productsFilter.taxonomyTermOptions.length
                ) {
                    taxonomy = (productsFilter.taxonomyTermOptions[0] as TaxonomyTerm).taxonomy as Taxonomy
                    formGroupOptions = this._formGroupOptionsFactoryMap
                        .get(ProductsFilterType.TaxonomyTermChecklist)(productsFilter)
                    existingFilterFinder = this._existingFilterFinderMap
                        .get(ProductsFilterType.TaxonomyTermChecklist)
                    newRequestFilterFactory = this._newRequestFilterFactoryMap
                        .get(ProductsFilterType.TaxonomyTermChecklist)
                }

                if (
                    productsFilter.filterType === ProductsFilterType.AttributeValueChecklist &&
                    productsFilter.attributeValueOptions.length
                ) {
                    attribute = (productsFilter.attributeValueOptions[0] as AttributeValue).attribute as Attribute
                    formGroupOptions = this._formGroupOptionsFactoryMap
                        .get(ProductsFilterType.AttributeValueChecklist)(productsFilter)
                    existingFilterFinder = this._existingFilterFinderMap
                        .get(ProductsFilterType.AttributeValueChecklist)
                    newRequestFilterFactory = this._newRequestFilterFactoryMap
                        .get(ProductsFilterType.AttributeValueChecklist)
                }

                if (productsFilter.filterType === ProductsFilterType.PriceRange) {
                    formGroupOptions = this._formGroupOptionsFactoryMap
                        .get(ProductsFilterType.PriceRange)(productsFilter)
                    existingFilterFinder = this._existingFilterFinderMap
                        .get(ProductsFilterType.PriceRange)
                    newRequestFilterFactory = this._newRequestFilterFactoryMap
                        .get(ProductsFilterType.PriceRange)
                }

                // Create the form.

                mteFormBuilder = this._mteFormBuilderService.create<ProductsFilterFormData>(formGroupOptions)

                // Attach useful data to the form builder for convenience.

                mteFormBuilder.data = {
                    attribute,
                    taxonomy,
                    productsFilter,
                }

                // Push a new request every time the form value changes.

                mteFormBuilder.formGroup.valueChanges
                    .pipe(
                        filter((formValue) => !isEqual(
                            formValue,
                            this._productsFilterFormValuesMap.get(productsFilter),
                        )),
                        filter(() => this._shouldExecuteRequestOnFormValueChanges),
                    )
                    .subscribe((formValue) => {
                        this._productsFilterFormValuesMap.set(productsFilter, formValue)
                        const request = this.store.state.getProductsRequest
                        const newRequestFilters = !!request.filters
                            ? [ ...request.filters ]
                            : []
                        const newRequest = {
                            ...request,
                            filters: newRequestFilters
                        }
                        if (typeof existingFilterFinder === 'function') {
                            const indexOfExistingFilter = newRequestFilters.findIndex(
                                existingFilterFinder(productsFilter)
                            )
                            if (indexOfExistingFilter > -1) {
                                newRequestFilters.splice(indexOfExistingFilter, 1)
                            }
                        }
                        if (typeof newRequestFilterFactory === 'function') {
                            newRequestFilters.push(newRequestFilterFactory(formValue))
                        }
                        this.store.dispatch(new GetProductsRequestUpdate(newRequest))
                    })

                return mteFormBuilder
            })
            .filter((formBuilder) => formBuilder !== undefined)

        this._updateFilterFormsFromRequest(this.store.state.getProductsRequest)
    }

    private _createRequestFromQueryParamMap(queryParamMap: ParamMap): GetProductsRequest {

        // Create a new request from the "r" query param.

        const requestStr = queryParamMap.get(ShopQueryParamKeys.request)
        const request = !!requestStr
            ? JSON.parse(atob(requestStr)) as GetProductsRequest
            : new GetProductsRequest()
        return request
    }

    private _mutateRequestFromRouteParamMap(request: GetProductsRequest, routeParamMap: ParamMap): GetProductsRequest {

        // Mutate the request if the route is '/for/:taxonomySlug/:partialTermSlug'.

        if (routeParamMap.get('taxonomySlug')) {
            const taxonomySlug = routeParamMap.get('taxonomySlug')
            const partialTermSlug = routeParamMap.get('partialTermSlug')

            if (!request.filters) {
                request.filters = []
            }

            // Always clear whichever filter was created by the last `/for/:taxonomySlug...` route.

            const lastTaxonomySlugFromRoute = this.store.state.getProductsRequestFromRoute.taxonomySlug
            const lastTaxTermSlugFromRoute = this.store.state.getProductsRequestFromRoute.taxonomyTermSlug
            if (lastTaxonomySlugFromRoute && lastTaxTermSlugFromRoute) {
                const indexOfFilterToRemove = request.filters.findIndex((filter) =>
                    filter.type === GetProductsFilterType.TaxonomyTerm &&
                    filter.key === lastTaxonomySlugFromRoute &&
                    isEqual(filter.values, [lastTaxTermSlugFromRoute]))
                if (indexOfFilterToRemove > -1) {
                    request.filters.splice(indexOfFilterToRemove, 1)
                }
            }

            // Add the new taxonomy term filter.

            request.filters = uniqWith<GetProductsFilter>([
                ...request.filters,
                {
                    type: GetProductsFilterType.TaxonomyTerm,
                    values: [ `${taxonomySlug}-${partialTermSlug}` ]
                },
            ], isEqual)

            this.store.dispatch(new GetProductsRequestFromRouteUpdate({
                taxonomySlug,
                taxonomyTermSlug: `${taxonomySlug}-${partialTermSlug}`
            }))
        }

        return request
    }

    // I'm pretty sure this needs to be here for AOT. #thanksaot

    public ngOnDestroy(): void { }

    public executeRequest(request: GetProductsRequest): Promise<Product[]> {
        let requestedTaxonomyTermFilter: GetProductsFilter
        let requestedTaxonomyTermSlug: string

        // Figure out if we need to fetch taxonomy term data along with the products.
        // (e.g. to display a banner for "Women's")

        if (request) {
            requestedTaxonomyTermFilter = request.filters && request.filters.filter((filter) => filter.type === GetProductsFilterType.TaxonomyTerm).length === 1
                ? request.filters.find((filter) => filter.type === GetProductsFilterType.TaxonomyTerm)
                : undefined
            requestedTaxonomyTermSlug = requestedTaxonomyTermFilter &&
                requestedTaxonomyTermFilter.values &&
                requestedTaxonomyTermFilter.values.length === 1
                // Note: we don't need the `key` from the filter since TaxonomyTerm slugs are unique.
                ? requestedTaxonomyTermFilter.values[0]
                : undefined
        }

        // Get the taxonomy term if one is found in the request.

        if (requestedTaxonomyTermSlug) {
            this._taxonomyTermService.getOne(requestedTaxonomyTermSlug)
                .pipe(takeWhile(() => this.isAlive))
                .subscribe((term) => this.taxonomyTerm = term)
        }
        else {
            this.taxonomyTerm = null
        }

        // Get products based on the parsed request.

        if (!this.productsStream) {
            this.productsStream = this._productService.getStream
        }
        this._productService.get(request)

        return this._productService.getStream.pipe(take(1)).toPromise()
    }

    // Responsive design.

    public layoutIsMdAboves(): Observable<boolean> {
        return this.windowRef.mediaBreakpointAboves(BootstrapBreakpointKey.Md)
    }
    public layoutIsNotMdAboves(): Observable<boolean> {
        return this.windowRef.mediaBreakpointAboves(BootstrapBreakpointKey.Md)
            .pipe(map((x) => !x))
    }

    // Event handlers.

    public handleProductClick(product: Product): void {
        this._router.navigateByUrl(ShopRouterLinks.productDetail(product.slug))
    }
    public clearFilters(): void {
        this._productsFilterFormBuilders.forEach((productsFilterFormBuilder) =>
            productsFilterFormBuilder.formGroup.reset())
    }

    // Boolean methods.

    public isOneColLayout(): boolean {
        return !!this.taxonomyTerm && !!this.taxonomyTerm.archiveGroupsTaxonomy
    }
    public isTwoColLayout(): boolean {
        return !this.isOneColLayout()
    }
    public isChecklist(productsFilter: ProductsFilter): boolean {
        return productsFilter.filterType === ProductsFilterType.TaxonomyTermChecklist ||
            productsFilter.filterType === ProductsFilterType.AttributeValueChecklist
    }
    public isPriceRange(productsFilter: ProductsFilter): boolean {
        return productsFilter.filterType === ProductsFilterType.PriceRange
    }
    private _shouldDisplayProductsFilter(productsFilter: ProductsFilter): boolean {
        if (productsFilter.displayAlways) return true

        // Display when a particular taxonomy term is included in the request.
        // TODO: Support conditions other than taxonomy terms.

        const expectedTaxonomyTermSlug = productsFilter.displayWhen.taxonomyTermSlug
        if (typeof expectedTaxonomyTermSlug !== 'undefined') {
            const requestFilters = this.store.state.getProductsRequest.filters

            // If we're in a taxonomy term view, we just need to check if the taxonomy term matches
            // the one we expect.

            return (this.taxonomyTerm && expectedTaxonomyTermSlug === this.taxonomyTerm.slug) ||

                // Otherwise, we need to check if there are any filters present in the request.

                (
                    !requestFilters ||
                    !requestFilters.length ||

                    // If there are filters present, check if there are any TaxonomyTerm filters.
                    // If not, then it's OK to display the filter.

                    !requestFilters.find((getProductsFilter) =>
                        getProductsFilter.type === GetProductsFilterType.TaxonomyTerm
                    ) ||

                    // If there are TaxonomyTerm filters present, THEN we need to validate that
                    // at least one of them matches our expected taxonomy term.

                    !!requestFilters.find((getProductsFilter) =>
                        getProductsFilter.type === GetProductsFilterType.TaxonomyTerm &&
                        getProductsFilter.values.find((taxonomyTermSlug) =>
                            taxonomyTermSlug === expectedTaxonomyTermSlug
                        )
                    )
                )
        }
        return true
    }

    private _updateFilterFormsFromRequest(getProductsRequest: GetProductsRequest): void {
        this._updateFormSilently(() => {
            if (getProductsRequest.filters) {
                getProductsRequest.filters.forEach((filter) => {
                    if (!!filter.values) {
                        filter.values
                            .filter((filterValue) => typeof filterValue === 'string')
                            .forEach((filterValue) => {
                                this._productsFilterFormBuilders
                                    .map((formBuilder) => formBuilder.formGroup)
                                    .forEach((formGroup) => {
                                        const formControlName = camelCase(filterValue)
                                        if (formGroup.get(formControlName)) {
                                            formGroup.patchValue({
                                                [formControlName]: true
                                            })
                                        }
                                    })
                            })
                    }
                    if (!!filter.range) {
                        const formControlName = camelCase(filter.key)
                        const formControl = this._productsFilterFormBuilders
                            .map((formBuilder) => formBuilder.formGroup)
                            .find((formGroup) => !!formGroup.get(formControlName))
                        if (formControl) {
                            formControl.patchValue({
                                [formControlName]: filter.range,
                            })
                        }
                    }
                })
            }
        })
    }

    private _registerExistingFilterFinder(
        type: ProductsFilterType,
        finderFn: (productsFilter?: ProductsFilter) => (getProductsFilter: GetProductsFilter) => boolean
    ): void {
        this._existingFilterFinderMap.set(type, finderFn)
    }

    private _registerFormGroupOptionsFactory(
        type: ProductsFilterType,
        formGroupOptionsFactory: (productsFilter?: ProductsFilter) => MteFormGroupOptions
    ): void {
        this._formGroupOptionsFactoryMap.set(type, formGroupOptionsFactory)
    }

    private _registerNewRequestFilterFactory(
        type: ProductsFilterType,
        newRequestFilterFactory: (formValue: any) => GetProductsFilter
    ): void {
        this._newRequestFilterFactoryMap.set(type, newRequestFilterFactory)
    }

    private _updateFormSilently(formUpdateFn: (...args: any[]) => any): void {
        this._shouldExecuteRequestOnFormValueChanges = false
        formUpdateFn()
        setTimeout(() => {
            this._shouldExecuteRequestOnFormValueChanges = true
        }, 100)
    }
}
