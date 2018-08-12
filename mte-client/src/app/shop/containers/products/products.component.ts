import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { MteFormGroupOptions } from '@mte/common/lib/ng-modules/forms/models/form-group-options'
import { MteFormBuilderService } from '@mte/common/lib/ng-modules/forms/services/form-builder.service'
import { MteFormBuilder } from '@mte/common/lib/ng-modules/forms/utilities/form.builder'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import { Product } from '@mte/common/models/api-interfaces/product'
import { TaxonomyTerm } from '@mte/common/models/api-interfaces/taxonomy-term'
import { Taxonomy } from '@mte/common/models/api-models/taxonomy'
import { GetProductsFilter, GetProductsFilterType, GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { BootstrapBreakpointKey } from '@mte/common/models/enums/bootstrap-breakpoint-key'
import { ProductsFilterType } from '@mte/common/models/enums/products-filter-type'
import { camelCase, isEqual, kebabCase, uniqWith, values } from 'lodash'
import { BehaviorSubject, Observable } from 'rxjs'
import { distinctUntilKeyChanged, map, takeWhile } from 'rxjs/operators'
import { OrganizationService } from '../../../shared/services/organization.service'
import { ShopQueryParamKeys } from '../../constants/shop-query-param-keys'
import { ShopRouterLinks } from '../../constants/shop-router-links'
import { ProductService } from '../../services/product.service'
import { TaxonomyTermService } from '../../services/taxonomy-term.service'
import { ProductsStateManager } from './products.state'

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
    public productsSource: Observable<Product[]>
    public taxonomyTerm: TaxonomyTerm
    public leftSidebarIsExpandeds: BehaviorSubject<boolean>
    public stateManager = new ProductsStateManager()
    public productsFilterForms: MteFormBuilder[]

    // Custom.
    // TODO: move elsewhere.

    public stabilitiesFormGroup = new FormGroup({
        underStable: new FormControl(false),
        stable: new FormControl(false),
        overStable: new FormControl(false),
    })

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

        this.productsFilterForms = values(storeUiSettings.productsFilters).map((productsFilter) => {
            const formGroupOptions: MteFormGroupOptions = {}
            // TODO: Add support for AttributeValueChecklist
            if (productsFilter.filterType === ProductsFilterType.TaxonomyTermChecklist) {
                const taxonomy = (productsFilter.taxonomyTermOptions[0] as TaxonomyTerm).taxonomy as Taxonomy
                productsFilter.taxonomyTermOptions.forEach((taxonomyTerm: TaxonomyTerm) => {
                    formGroupOptions[camelCase(taxonomyTerm.slug)] = {
                        defaultValue: false,
                        label: taxonomyTerm.singularName || taxonomyTerm.slug,
                        formControlType: 'checkbox',
                    }
                })
                const mteFormBuilder = this._mteFormBuilderService.create(formGroupOptions)
                mteFormBuilder.data = {
                    label: taxonomy.pluralName,
                }
                mteFormBuilder.formGroup.valueChanges.subscribe((formValue) => {
                    const request = this.stateManager.state.getProductsRequest
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
                        values: Object.keys(formValue).map((key) => kebabCase(key))
                    })
                    this.stateManager.setState({ getProductsRequest: newRequest })
                })
                return mteFormBuilder
            }

            /*
            this.stabilitiesFormGroup.valueChanges.subscribe((value) => {
                const request = this.stateManager.state.getProductsRequest
                const newRequestFilters = !!request.filters
                    ? [ ...request.filters ]
                    : []
                const newRequest = {
                    ...request,
                    filters: newRequestFilters
                }
                const indexOfExistingStabilityFilter = newRequestFilters.findIndex((filter) => {
                    return filter.values.some((filterValue) =>
                        filterValue.indexOf('stability-') === 0)
                })
                if (indexOfExistingStabilityFilter > -1) {
                    newRequestFilters.splice(indexOfExistingStabilityFilter, 1)
                }
                const values = []
                if (value.underStable) {
                    values.push('stability-understable')
                }
                if (value.stable) {
                    values.push('stability-stable')
                }
                if (value.overStable) {
                    values.push('stability-overstable')
                }
                newRequestFilters.push({
                    type: GetProductsFilterType.TaxonomyTerm,
                    values
                })

                this.stateManager.setState({ getProductsRequest: newRequest })
            })
            */
        })

        // Execute the request any time it changes.

        this.stateManager.states
            .pipe(
                distinctUntilKeyChanged('getProductsRequest'),
                map((state) => state.getProductsRequest)
            )
            .subscribe((request) => {
                this.executeRequest(request)

                // Custom functionality.
                // TODO: move elsewhere.

                if (request.filters) {
                    request.filters.forEach((filter) => {
                        filter.values.filter((value) => value.indexOf('stability-') === 0)
                            .forEach((stabilityTaxTerm) => {
                                if (stabilityTaxTerm === 'stability-understable' && this.stabilitiesFormGroup.get('underStable').value === false) {
                                    this.stabilitiesFormGroup.patchValue({ underStable: true })
                                }
                                if (stabilityTaxTerm === 'stability-stable' && this.stabilitiesFormGroup.get('stable').value === false) {
                                    this.stabilitiesFormGroup.patchValue({ stable: true })
                                }
                                if (stabilityTaxTerm === 'stability-overstable' && this.stabilitiesFormGroup.get('overStable').value === false) {
                                    this.stabilitiesFormGroup.patchValue({ overStable: true })
                                }
                            })
                    })
                }

                // END Custom functionality.
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
                    this.stateManager.setState({
                        getProductsRequest: newRequest
                    })
                }
            })

        // Mutate the request when the route params change.

        this._activatedRoute.paramMap
            .pipe(takeWhile(() => this.isAlive))
            .subscribe((paramMap) => {
                const getProductsRequest = this._mutateRequestFromRouteParamMap(
                    this.stateManager.state.getProductsRequest,
                    paramMap
                )
                this.stateManager.setState({ getProductsRequest })
            })

        // Custom functionality.
        // TODO: move elsewhere.

        this.stabilitiesFormGroup.valueChanges.subscribe((value) => {
            const request = this.stateManager.state.getProductsRequest
            const newRequestFilters = !!request.filters
                ? [ ...request.filters ]
                : []
            const newRequest = {
                ...request,
                filters: newRequestFilters
            }
            const indexOfExistingStabilityFilter = newRequestFilters.findIndex((filter) => {
                return filter.values.some((filterValue) =>
                    filterValue.indexOf('stability-') === 0)
            })
            if (indexOfExistingStabilityFilter > -1) {
                newRequestFilters.splice(indexOfExistingStabilityFilter, 1)
            }
            const values = []
            if (value.underStable) {
                values.push('stability-understable')
            }
            if (value.stable) {
                values.push('stability-stable')
            }
            if (value.overStable) {
                values.push('stability-overstable')
            }
            newRequestFilters.push({
                type: GetProductsFilterType.TaxonomyTerm,
                values
            })

            this.stateManager.setState({ getProductsRequest: newRequest })
        })

        // END Custom functionality.
    }

    private _createRequestFromQueryParamMap(queryParamMap: ParamMap): GetProductsRequest {

        // Create a new request from the "r" query param.

        const requestStr = queryParamMap.get(ShopQueryParamKeys.request)
        const request = !!requestStr ? JSON.parse(atob(requestStr)) as GetProductsRequest : null
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

            const lastTaxonomySlugFromRoute = this.stateManager.state.getProductsRequestFromRoute.taxonomySlug
            const lastTaxTermSlugFromRoute = this.stateManager.state.getProductsRequestFromRoute.taxonomyTermSlug
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

            this.stateManager.setState({
                getProductsRequestFromRoute: {
                    taxonomySlug,
                    taxonomyTermSlug: `${taxonomySlug}-${partialTermSlug}`
                }
            })
        }

        return request
    }

    public executeRequest(request: GetProductsRequest): void {
        let requestedTaxonomyTermFilter: GetProductsFilter
        let requestedTaxonomyTermSlug: string

        // Figure out if we need to fetch taxonomy term data along with the products.
        // (e.g. to display a banner for "Women's")

        if (request) {
            requestedTaxonomyTermFilter = request.filters && request.filters.filter((filter) => filter.type === GetProductsFilterType.TaxonomyTerm).length === 1
                ? request.filters.find((filter) => filter.type === GetProductsFilterType.TaxonomyTerm)
                : undefined
            requestedTaxonomyTermSlug = requestedTaxonomyTermFilter && requestedTaxonomyTermFilter.values
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

        if (!this.productsSource) {
            this.productsSource = this._productService.getSource
        }
        this._productService.get(request)
    }

    // I'm pretty sure this needs to be here for AOT. #thanksaot

    public ngOnDestroy(): void { }

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

    // Boolean methods.

    public isOneColLayout(): boolean {
        return !!this.taxonomyTerm && !!this.taxonomyTerm.archiveGroupsTaxonomy
    }
    public isTwoColLayout(): boolean {
        return !this.isOneColLayout()
    }

    // Custom functionality.
    // TODO: move elsewhere.

    public isDisplayingDiscs(): boolean {
        if (!this._productService.documents) {
            return false
        }
        return this._productService.documents.some((product) =>
            product.taxonomyTerms.some((taxTerm: TaxonomyTerm) =>
                taxTerm.slug === 'product-type-discs'))
    }

    // END Custom functionality.
}
