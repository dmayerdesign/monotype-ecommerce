import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { Attribute } from '@mte/common/api/interfaces/attribute'
import { Product } from '@mte/common/api/interfaces/product'
import { ProductsFilter } from '@mte/common/api/interfaces/products-filter'
import { Taxonomy } from '@mte/common/api/interfaces/taxonomy'
import { TaxonomyTerm } from '@mte/common/api/interfaces/taxonomy-term'
import { GetProductsFilter, GetProductsFilterType, GetProductsRequest } from '@mte/common/api/requests/get-products.request'
import { BootstrapBreakpointKey } from '@mte/common/constants/enums/bootstrap-breakpoint-key'
import { ProductsFilterType } from '@mte/common/constants/enums/products-filter-type'
import { MongooseHelper as mh } from '@mte/common/helpers/mongoose.helper'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { MteFormGroupOptions } from '@mte/common/lib/ng-modules/forms/models/form-group-options'
import { MteFormBuilderService } from '@mte/common/lib/ng-modules/forms/services/form-builder.service'
import { MteFormBuilder } from '@mte/common/lib/ng-modules/forms/utilities/form.builder'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import { Store } from '@mte/common/lib/state-manager/store'
import { camelCase, isEqual, kebabCase, uniqWith } from 'lodash'
import { BehaviorSubject, Observable } from 'rxjs'
import { debounceTime, filter, map, takeWhile } from 'rxjs/operators'
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
    public taxonomyTerm: TaxonomyTerm
    public leftSidebarIsExpandeds: BehaviorSubject<boolean>
    public store = new Store<ProductsState>(new ProductsState(), productsReducer)
    public productsFilterFormBuilders: MteFormBuilder[]

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
        const { storeUiSettings } = this._organizationService.organization

        // Expand the left sidebar if the screen width is large or above.

        this.leftSidebarIsExpandeds = new BehaviorSubject(
            this.windowRef.mediaBreakpointAbove(BootstrapBreakpointKey.Lg)
        )

        // Set up the filters.
        // TODO: Instead of importing `productsFilters`, get `organization.storeUiSettings.productsFilters`.

        this.productsFilterFormBuilders = mh.toArray<ProductsFilter>(storeUiSettings.productsFilters)
            .filter((productsFilter) => productsFilter.enabled)
            .map((productsFilter) => {
                const formGroupOptions: MteFormGroupOptions = {}

                // Configure a checklist of taxonomy terms.
                // TODO: Add support for AttributeValueChecklist.

                if (
                    productsFilter.filterType === ProductsFilterType.TaxonomyTermChecklist &&
                    productsFilter.taxonomyTermOptions.length
                ) {
                    const taxonomy = (productsFilter.taxonomyTermOptions[0] as TaxonomyTerm).taxonomy as Taxonomy
                    let mteFormBuilder: MteFormBuilder<ProductsFilterFormData>
                    let lastFormValue: any

                    // Build the form.

                    productsFilter.taxonomyTermOptions.forEach((taxonomyTerm: TaxonomyTerm) => {
                        formGroupOptions[camelCase(taxonomyTerm.slug)] = {
                            defaultValue: false,
                            label: taxonomyTerm.singularName || taxonomyTerm.slug,
                            formControlType: 'checkbox',
                        }
                    })
                    mteFormBuilder = this._mteFormBuilderService.create<ProductsFilterFormData>(formGroupOptions)

                    // Attach useful data to the form builder for convenience.

                    mteFormBuilder.data = {
                        taxonomy,
                        productsFilter,
                    }

                    // Push a new request every time the form value changes.

                    mteFormBuilder.formGroup.valueChanges
                        .pipe(
                            filter((formValue) => !isEqual(formValue, lastFormValue))
                        )
                        .subscribe((formValue) => {
                            lastFormValue = formValue
                            const request = this.store.state.getProductsRequest
                            const newRequestFilters = !!request.filters
                                ? [ ...request.filters ]
                                : []
                            const newRequest = {
                                ...request,
                                filters: newRequestFilters
                            }
                            const indexOfExistingFilter = newRequestFilters.findIndex((filter) => {
                                return filter.values.some((filterValue) =>
                                    productsFilter.taxonomyTermOptions.some((taxonomyTerm: TaxonomyTerm) =>
                                        filterValue === taxonomyTerm.slug))
                            })
                            if (indexOfExistingFilter > -1) {
                                newRequestFilters.splice(indexOfExistingFilter, 1)
                            }
                            newRequestFilters.push({
                                type: GetProductsFilterType.TaxonomyTerm,
                                values: Object.keys(formValue)
                                    .filter((key) => !!formValue[key])
                                    .map((key) => kebabCase(key))
                            })
                            this.store.dispatch(new GetProductsRequestUpdate(newRequest))
                        })
                    return mteFormBuilder
                }
            })
            .filter((formBuilder) => formBuilder !== undefined)

        // Execute the request any time it changes.

        this.store.reactTo(GetProductsRequestUpdate)
            .pipe(
                // Makes sure that `clearFilters` doesn't trigger multiple requests.
                debounceTime(100),
                map(() => this.store.state)
            )
            .subscribe(({ getProductsRequest }) => {
                this.executeRequest(getProductsRequest)

                if (getProductsRequest.filters) {
                    getProductsRequest.filters.forEach((filter) => {
                        filter.values.forEach((filterValue) => {
                            this.productsFilterFormBuilders
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
                    })
                }
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
                // this.stateManager.setState({ getProductsRequest })
                this.store.dispatch(new GetProductsRequestUpdate(getProductsRequest))
            })
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

    public executeRequest(request: GetProductsRequest): void {
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
        this.productsFilterFormBuilders.forEach((productsFilterFormBuilder) =>
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
}
