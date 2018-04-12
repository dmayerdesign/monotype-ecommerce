import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { Product } from '@mte/common/models/api-models/product'
import { GetProductsFilterType, GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { takeWhile } from 'rxjs/operators/takeWhile'
import { ProductService } from '../../services'

@Component({
    selector: 'mte-products-by-term',
    templateUrl: './products-by-term.component.html',
    styleUrls: ['./products-by-term.component.scss']
})
@Heartbeat()
export class ProductsByTermComponent implements OnInit, OnDestroy {
    private isAlive = false
    public products: Observable<Product[]>

    constructor(
        private productService: ProductService,
        public activatedRoute: ActivatedRoute
    ) { }

    public ngOnInit(): void {
        this.activatedRoute.paramMap
            .pipe(takeWhile(() => this.isAlive))
            .subscribe((paramMap) => {
                const taxonomySlug = paramMap.get('taxonomySlug')
                const taxonomyTermSlug = paramMap.get('taxonomyTermSlug')

                if (!this.products) {
                    this.products = this.productService.getSource
                }
                this.productService.get(new GetProductsRequest({
                    filters: [
                        {
                            type: GetProductsFilterType.Taxonomy,
                            key: taxonomySlug,
                            values: [ taxonomyTermSlug ]
                        }
                    ]
                }))
            })
    }

    public ngOnDestroy(): void { }

    public getGridContainerClasses(): string[] {
        const identifiers = [ 'products-grid-container' ]
        const bootstrapLayoutClasses = [ 'col-12' ]
        return [
            ...bootstrapLayoutClasses,
            ...identifiers,
        ]
    }
}
