import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { Product } from '@mte/common/models/api-models/product'
import { TaxonomyTerm } from '@mte/common/models/api-models/taxonomy-term'
import { GetProductsFilterType, GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { WindowRefService } from '@mte/common/ng-modules/ui/services/window-ref.service'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/takeWhile'
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
    public isAlive = false
    public productss: Observable<Product[]>
    public taxonomyTerms: Observable<TaxonomyTerm>
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
        this.leftSidebarIsExpandeds = new BehaviorSubject(this.windowRef.mediaBreakpointAbove('lg'))

        // Trigger a search whenever the query params change.

        this.activatedRoute.queryParamMap
            .takeWhile(() => this.isAlive)
            .subscribe((queryParamMap) => {
                const requestStr = queryParamMap.get('request')
                const request = JSON.parse(requestStr) as GetProductsRequest
                const requestedTaxonomyTerm = request.filters && request.filters.filter((filter) => filter.type === GetProductsFilterType.Taxonomy).length === 1
                    ? request.filters.find((filter) => filter.type === GetProductsFilterType.Taxonomy)
                    : undefined
                const requestedTaxonomyTermSlug = requestedTaxonomyTerm && requestedTaxonomyTerm.values
                    ? requestedTaxonomyTerm.values[0] // Note: we don't need the `key` from the filter since TaxonomyTerm slugs are unique.
                    : undefined

                // Get products based on the parsed request.
                if (!this.productss) {
                    this.productss = this.productService.getSource
                }
                this.productService.get(new GetProductsRequest(request))

                // Get the taxonomy term if one is found in the request.
                if (requestedTaxonomyTermSlug) {
                    this.taxonomyTerms = this.taxonomyTermService.getOneSource
                    this.taxonomyTermService.getOne(requestedTaxonomyTermSlug)
                }
            })
    }

    // I'm pretty sure this needs to be here for AOT.
    // #thanksaot

    public ngOnDestroy(): void { }

    // Apply the filter, thus triggering a search.

    public applyFilter(): void {
        this.router.navigate([ShopRouterLinks.shopAll], {
            queryParams: {
                request: JSON.stringify(this.request)
            }
        })
    }

    // Classes.

    public getLeftSidebarClasses(): string[] {
        const identifiers = [ 'products-left-sidebar' ]
        const bootstrapLayoutClasses = [ 'col-lg-4', 'col-sm-12' ]
        return [
            ...bootstrapLayoutClasses,
            ...identifiers,
        ]
    }
    public getGridContainerClasses(): string[] {
        const identifiers = [ 'products-grid-container' ]
        const bootstrapLayoutClasses = [ 'col-lg-8', 'col-sm-12' ]
        return [
            ...bootstrapLayoutClasses,
            ...identifiers,
        ]
    }

    // Bootstrap.

    public layoutIsMdAboves(): Observable<boolean> {
        return this.windowRef.mediaBreakpointAboves('md')
    }
    public layoutIsNotMdAboves(): Observable<boolean> {
        return this.windowRef.mediaBreakpointAboves('md').map((x) => !x)
    }
}
