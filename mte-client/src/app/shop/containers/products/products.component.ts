import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import { Product } from '@mte/common/models/api-models/product'
import { TaxonomyTerm } from '@mte/common/models/api-models/taxonomy-term'
import { GetProductsFilter, GetProductsFilterType, GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { BootstrapBreakpointKey } from '@mte/common/models/enums/bootstrap-breakpoint-key'
import { cloneDeep } from 'lodash'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { map, takeWhile } from 'rxjs/operators'
import { ShopRouterLinks } from '../../constants/shop-router-links'
import { ProductService } from '../../services'
import { TaxonomyTermService } from '../../services/taxonomy-term.service'

@Component({
    selector: 'mte-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss']
})
@Heartbeat()
export class ProductsComponent implements OnInit, OnDestroy {
    @Input() public title: string
    public isAlive = false
    public productss: Observable<Product[]>
    public taxonomyTerm: TaxonomyTerm
    public leftSidebarIsExpandeds: BehaviorSubject<boolean>
    public request: GetProductsRequest

    constructor(
        private productService: ProductService,
        private taxonomyTermService: TaxonomyTermService,
        public windowRef: WindowRefService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) { }

    public ngOnInit(): void {
        this.leftSidebarIsExpandeds = new BehaviorSubject(this.windowRef.mediaBreakpointAbove(BootstrapBreakpointKey.Lg))

        const route = this.activatedRoute.snapshot

        // Trigger a search when the route is '/for/:taxonomySlug/:partialTermSlug'

        if (route.paramMap.get('taxonomySlug')) {
            this.activatedRoute.paramMap
                .pipe(takeWhile(() => this.isAlive))
                .subscribe((paramMap) => {
                    const taxonomySlug = paramMap.get('taxonomySlug')
                    const partialTermSlug = paramMap.get('partialTermSlug')

                    const request = new GetProductsRequest({
                        filters: [{
                            type: GetProductsFilterType.Taxonomy,
                            key: taxonomySlug,
                            values: [ `${taxonomySlug}-${partialTermSlug}` ]
                        }]
                    })

                    this.executeRequest(request)
                })
        }

        // Trigger a search whenever the query params change.

        else {
            this.activatedRoute.queryParamMap
                .pipe(takeWhile(() => this.isAlive))
                .subscribe((queryParamMap) => {
                    const requestStr = queryParamMap.get('request')
                    const request = !!requestStr ? JSON.parse(requestStr) as GetProductsRequest : {}
                    this.executeRequest(request)
                })
        }
    }

    public executeRequest(request: GetProductsRequest): void {
        let requestedTaxonomyTermFilter: GetProductsFilter
        let requestedTaxonomyTermSlug: string

        this.taxonomyTerm = null

        if (request) {
            requestedTaxonomyTermFilter = request.filters && request.filters.filter((filter) => filter.type === GetProductsFilterType.Taxonomy).length === 1
                ? request.filters.find((filter) => filter.type === GetProductsFilterType.Taxonomy)
                : undefined
            requestedTaxonomyTermSlug = requestedTaxonomyTermFilter && requestedTaxonomyTermFilter.values
                ? requestedTaxonomyTermFilter.values[0] // Note: we don't need the `key` from the filter since TaxonomyTerm slugs are unique.
                : undefined
        }

        // Get products based on the parsed request.
        if (!this.productss) {
            this.productss = this.productService.getSource
        }
        this.productService.get(new GetProductsRequest(request))

        // Get the taxonomy term if one is found in the request.
        if (requestedTaxonomyTermSlug) {
            this.taxonomyTermService.getOneSource
                .pipe(takeWhile(() => this.isAlive))
                .subscribe((term) => this.taxonomyTerm = term)
            this.taxonomyTermService.getOne(requestedTaxonomyTermSlug)
        }
    }

    // I'm pretty sure this needs to be here for AOT. #thanksaot

    public ngOnDestroy(): void { }

    // Classes.

    public getLeftSidebarClasses(): string[] {
        const identifiers = [ 'products-left-sidebar' ]
        const bootstrapLayoutClasses = [ 'col-lg-4', 'col-sm-12' ]
        return [
            ...bootstrapLayoutClasses,
            ...identifiers,
        ]
    }
    public getGridContainerWithSidebarClasses(): string[] {
        const identifiers = [ 'products-grid-container' ]
        const bootstrapLayoutClasses = [ 'col-lg-8', 'col-sm-12' ]
        return [
            ...bootstrapLayoutClasses,
            ...identifiers,
        ]
    }
    public getGridContainerFullWidthClasses(): string[] {
        const identifiers = [ 'products-grid-container' ]
        const bootstrapLayoutClasses = [ 'col-12' ]
        return [
            ...bootstrapLayoutClasses,
            ...identifiers,
        ]
    }

    // Bootstrap.

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
     * Apply the filter, thus triggering a search.
     */
    public applyFilter(): void {
        this.router.navigate([ShopRouterLinks.shopAll], {
            queryParams: {
                request: JSON.stringify(this.request)
            }
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
