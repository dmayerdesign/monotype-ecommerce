import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import { Product } from '@mte/common/models/api-interfaces/product'
import { TaxonomyTerm } from '@mte/common/models/api-interfaces/taxonomy-term'
import { GetProductsFilter, GetProductsFilterType, GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { BootstrapBreakpointKey } from '@mte/common/models/enums/bootstrap-breakpoint-key'
import { isEqual, uniqWith } from 'lodash'
import { merge, BehaviorSubject, Observable, Subject } from 'rxjs'
import { map, takeWhile } from 'rxjs/operators'
import { ShopQueryParamKeys } from '../../constants/shop-query-param-keys'
import { ShopRouterLinks } from '../../constants/shop-router-links'
import { ProductService } from '../../services/product.service'
import { TaxonomyTermService } from '../../services/taxonomy-term.service'

@Component({
    selector: 'mte-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss']
})
@Heartbeat()
export class ProductsComponent extends HeartbeatComponent implements OnInit, OnDestroy {
    @Input() public title: string
    public productsSource: Observable<Product[]>
    public taxonomyTerm: TaxonomyTerm
    public leftSidebarIsExpandeds: BehaviorSubject<boolean>
    private _requestPump = new Subject<GetProductsRequest>()
    private _request = new GetProductsRequest()
    private _lastUnparsedRequest: string

    constructor(
        private productService: ProductService,
        private taxonomyTermService: TaxonomyTermService,
        public windowRef: WindowRefService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) { super() }

    public ngOnInit(): void {
        this.leftSidebarIsExpandeds = new BehaviorSubject(
            this.windowRef.mediaBreakpointAbove(BootstrapBreakpointKey.Lg)
        )
        const route = this.activatedRoute.snapshot

        // Execute the request any time it changes.

        this._requestPump
            .subscribe((request) => {
                this.executeRequest(request)
            })

        // Construct a new request when the URL changes.

        const paramMaps = merge(
            this.activatedRoute.paramMap,
            this.activatedRoute.queryParamMap,
        )
        paramMaps
            .pipe(takeWhile(() => this.isAlive))
            .subscribe((_paramMap) => {
                const paramMap = route.paramMap
                const queryParamMap = route.queryParamMap

                // Replace the request whenever the query params change.

                const requestStr = queryParamMap.get(ShopQueryParamKeys.request)
                if (requestStr) {
                    this._request = JSON.parse(requestStr) as GetProductsRequest
                }

                // Mutate the request if the route is '/for/:taxonomySlug/:partialTermSlug'.

                if (paramMap.get('taxonomySlug')) {
                    const taxonomySlug = paramMap.get('taxonomySlug')
                    const partialTermSlug = paramMap.get('partialTermSlug')

                    if (!this._request.filters) {
                        this._request.filters = []
                    }
                    this._request.filters = uniqWith<GetProductsFilter>([
                        ...this._request.filters,
                        {
                            type: GetProductsFilterType.TaxonomyTerm,
                            key: taxonomySlug,
                            values: [ `${taxonomySlug}-${partialTermSlug}` ]
                        },
                    ], isEqual)
                    this._requestPump.next(this._request)
                }
                else if (requestStr !== this._lastUnparsedRequest) {
                    this._lastUnparsedRequest = requestStr
                    this._requestPump.next(this._request)
                }
            })
        /*
?r={"filters":[{"type":1,"values":["5b208b8ee0d70ab68576ea41"]}]}
        */
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
            this.taxonomyTermService.getOne(requestedTaxonomyTermSlug)
                .pipe(takeWhile(() => this.isAlive))
                .subscribe((term) => this.taxonomyTerm = term)
        }
        else {
            this.taxonomyTerm = null
        }

        // Get products based on the parsed request.

        if (!this.productsSource) {
            this.productsSource = this.productService.getSource
        }
        this.productService.get(request)
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
        this.router.navigateByUrl(ShopRouterLinks.productDetail(product.slug))
    }

    /**
     * Apply the filter, triggering a search.
     */
    public applyFilter(key: string, value: any): void {
        this.router.navigate([ShopRouterLinks.shopAll], {
            queryParams: {
                [ShopQueryParamKeys.request]: JSON.stringify(this._request)
            },
        })
    }

    // Boolean methods.

    public isOneColLayout(): boolean {
        return !!this.taxonomyTerm && !!this.taxonomyTerm.archiveGroupsTaxonomy
    }
    public isTwoColLayout(): boolean {
        return !this.isOneColLayout()
    }
}
