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
import { MteFormBuilder } from '@mte/common/lib/ng-modules/forms/utilities/form.builder'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import { Store } from '@ngrx/store'
import { isEqual, uniqWith } from 'lodash'
import { combineLatest, BehaviorSubject, Observable } from 'rxjs'
import { distinctUntilChanged, map, take, takeWhile } from 'rxjs/operators'
import { AppState } from '../../../state/app.state'
import { ShopQueryParamKeys } from '../../constants/shop-query-param-keys'
import { ShopRouterLinks } from '../../constants/shop-router-links'
import { ProductService } from '../../services/product.service'
import { ProductsFiltersService } from '../../services/products-filters.service'
import { GetProductsRequestFromRouteUpdate, GetProductsRequestUpdate, ProductsFilterFormsReset, RequestCreationFromParamMaps } from '../../shop.actions'
import { selectProducts } from '../../shop.selectors'
import { GetProductsRequestFromRoute } from '../../shop.state'

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

        this.isOneColLayout = this._store.pipe(
            selectProducts,
            map((productsState) => productsState.taxonomyTerm),
            map((taxonomyTerm) => taxonomyTerm && !!taxonomyTerm.archiveGroupsTaxonomy),
        )
        this.isTwoColLayout = this.isOneColLayout.pipe(
            map((isOneColLayout) => !isOneColLayout)
        )

        // Expand the left sidebar if the screen width is large or above.

        this.leftSidebarIsExpandeds = new BehaviorSubject(
            this.windowRef.mediaBreakpointAbove(BootstrapBreakpointKey.Lg)
        )

        // Construct a new request when the query params or route params change.
        // TODO: Expose this functionality to the user by allowing them to copy a link to
        // whatever particular search/filter they have going on (to bookmark or share).
        // By default, no request data will be shown in the URL.
        combineLatest(
            this._activatedRoute.queryParamMap,
            this._activatedRoute.paramMap,
        )
            .pipe(takeWhile(() => this.isAlive))
            .subscribe(async ([ queryParamMap, routeParamMap ]) => {
                this._store.dispatch(new RequestCreationFromParamMaps({
                    queryParamMap,
                    routeParamMap,
                }))

                const { getProductsRequest, getProductsRequestFromRoute } = await this._store.pipe(
                    selectProducts,
                    take(1),
                ).toPromise()
            })
    }

    public isChecklist(productsFilter: ProductsFilter): boolean {
        return this._productsFiltersService.isChecklist(productsFilter)
    }

    public isPriceRange(productsFilter: ProductsFilter): boolean {
        return this._productsFiltersService.isPriceRange(productsFilter)
    }

    public get productsFilterFormBuildersStream(): Observable<MteFormBuilder[]> {
        return this._productsFiltersService.productsFilterFormBuildersStream
    }

    // I'm pretty sure this needs to be here for AOT. #thanksaot

    public ngOnDestroy(): void { }

    // Template accessors.

    public get priceRange(): Price[] {
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
