import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { Attribute } from '@mte/common/api/interfaces/attribute'
import { Price } from '@mte/common/api/interfaces/price'
import { Product } from '@mte/common/api/interfaces/product'
import { ProductsFilter } from '@mte/common/api/interfaces/products-filter'
import { Taxonomy } from '@mte/common/api/interfaces/taxonomy'
import { TaxonomyTerm } from '@mte/common/api/interfaces/taxonomy-term'
import { GetProductsFilter, GetProductsFilterType, GetProductsRequest } from '@mte/common/api/requests/get-products.request'
import { BootstrapBreakpointKey } from '@mte/common/constants/enums/bootstrap-breakpoint-key'
import { RangeLimit } from '@mte/common/constants/enums/range-limit'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import { Store } from '@ngrx/store'
import { isEqual, uniqWith } from 'lodash'
import { BehaviorSubject, Observable } from 'rxjs'
import { map, take, takeWhile, withLatestFrom } from 'rxjs/operators'
import { AppState } from '../../../state/app.state'
import { ShopQueryParamKeys } from '../../constants/shop-query-param-keys'
import { ShopRouterLinks } from '../../constants/shop-router-links'
import { ProductService } from '../../services/product.service'
import { ProductsFiltersService } from '../../services/products-filters.service'
import { GetProductsRequestFromRouteUpdate, GetProductsRequestUpdate, ProductsFilterFormsReset } from '../../shop.actions'
import { shopSelectorKey } from '../../shop.selectors'
import { ShopState } from '../../shop.state'

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
        ProductsFiltersService,
    ],
})
@Heartbeat()
export class ProductsComponent extends HeartbeatComponent implements OnInit, OnDestroy {
    @Input() public title: string
    public productsStream: Observable<Product[]>
    public taxonomyTerm: TaxonomyTerm
    public leftSidebarIsExpandeds: BehaviorSubject<boolean>
    public rangeLimit = RangeLimit
    public isOneColLayout: Observable<boolean>
    public isTwoColLayout: Observable<boolean>

    constructor(
        public windowRef: WindowRefService,
        private _productService: ProductService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _store: Store<AppState>,
        private _productsFiltersService: ProductsFiltersService,
    ) { super() }

    public ngOnInit(): void {

        this.productsStream = this._productService.getStream

        this.isOneColLayout = this._store.select<ShopState>(shopSelectorKey).pipe(
            map((shopState) => shopState.products.taxonomyTerm),
            map((taxonomyTerm) => taxonomyTerm && !!taxonomyTerm.archiveGroupsTaxonomy),
        )
        this.isTwoColLayout = this.isOneColLayout.pipe(
            map((isOneColLayout) => !isOneColLayout)
        )

        // Expand the left sidebar if the screen width is large or above.

        this.leftSidebarIsExpandeds = new BehaviorSubject(
            this.windowRef.mediaBreakpointAbove(BootstrapBreakpointKey.Lg)
        )

        // Construct a new request when the query params change.
        // TODO: Expose this functionality to the user by allowing them to copy a link to
        // whatever particular search/filter they have going on (to bookmark or share).
        // By default, no request data will be shown in the URL.

        this._activatedRoute.queryParamMap
            .pipe(takeWhile(() => this.isAlive))
            .subscribe((queryParamMap) => {
                const paramMap = this._activatedRoute.snapshot.paramMap

                let getProductsRequest: GetProductsRequest
                getProductsRequest = this._createRequestFromQueryParamMap(queryParamMap)
                getProductsRequest = this._mutateRequestFromRouteParamMap(getProductsRequest, paramMap)

                if (getProductsRequest) {
                    this._store.dispatch(new GetProductsRequestUpdate({
                        request: getProductsRequest,
                        crudService: this._productService,
                    }))
                }
            })

        // Mutate the request when the route params change.

        this._activatedRoute.paramMap
            .pipe(
                takeWhile(() => this.isAlive),
                withLatestFrom(this._store.select<ShopState>(shopSelectorKey)),
            )
            .subscribe(([paramMap, shopState]) => {
                const getProductsRequest = this._mutateRequestFromRouteParamMap(
                    shopState.products.getProductsRequest,
                    paramMap
                )
                this._store.dispatch(new GetProductsRequestUpdate({
                    request: getProductsRequest,
                    crudService: this._productService,
                }))
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

            if (!request.filters) request.filters = []

            // Always clear whichever filter was created by the last `/for/:taxonomySlug...` route.

            this._store.select<ShopState>(shopSelectorKey)
                .pipe(
                    map((shopState) => shopState.products.getProductsRequestFromRoute),
                    take(1),
                )
                .subscribe((getProductsRequestFromRoute) => {
                    const lastTaxonomySlugFromRoute = getProductsRequestFromRoute.taxonomySlug
                    const lastTaxTermSlugFromRoute = getProductsRequestFromRoute.taxonomyTermSlug
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

                    this._store.dispatch(new GetProductsRequestFromRouteUpdate({
                        taxonomySlug,
                        taxonomyTermSlug: `${taxonomySlug}-${partialTermSlug}`
                    }))
                })
        }

        return request
    }

    // I'm pretty sure this needs to be here for AOT. #thanksaot

    public ngOnDestroy(): void { }

    // Template accessors.

    public priceRange(): Price[] {
        return this._productsFiltersService.priceRange
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
        this._store.dispatch(new ProductsFilterFormsReset())
    }
}
