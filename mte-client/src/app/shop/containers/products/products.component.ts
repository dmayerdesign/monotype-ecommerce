import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Product } from '@mte/common/models/api-models/product'
import { GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { WindowRefService } from '@mte/common/ng-modules/ui/services/window-ref.service'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/takeWhile'
import { ShopRouterLinks } from '../../constants/shop-router-links'
import { ProductService } from '../../services'

@Component({
    selector: 'mte-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
    private isAlive = false

    public products: Observable<Product[]>
    public leftSidebarIsExpandeds: BehaviorSubject<boolean>
    public request: GetProductsRequest

    constructor(
        private productService: ProductService,
        public windowRef: WindowRefService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) { }

    public ngOnInit(): void {
        this.isAlive = true
        this.leftSidebarIsExpandeds = new BehaviorSubject(this.windowRef.mediaBreakpointAbove('lg'))

        this.activatedRoute.queryParamMap
            .takeWhile(() => this.isAlive)
            .subscribe((queryParamMap) => {
console.log(queryParamMap)
                const requestStr = queryParamMap.get('request')
                const request = JSON.parse(requestStr) as GetProductsRequest

                if (!this.products) {
                    this.products = this.productService.getSource
                }
                this.productService.get(new GetProductsRequest(request))
            })
    }

    public ngOnDestroy(): void {
        this.isAlive = false
    }

    public applyFilter(): void {
        this.router.navigate([ShopRouterLinks.shopAll], {
            queryParams: {
                request: JSON.stringify(this.request)
            }
        })
    }

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

    public layoutIsMdAboves(): Observable<boolean> {
        return this.windowRef.mediaBreakpointAboves('md')
    }

    public layoutIsNotMdAboves(): Observable<boolean> {
        return this.windowRef.mediaBreakpointAboves('md').map((x) => !x)
    }
}
