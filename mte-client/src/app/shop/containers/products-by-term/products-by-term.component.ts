import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Product } from '@mte/common/models/api-models/product'
import { GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/takeWhile'
import { ProductService } from '../../services'

@Component({
    selector: 'mte-products-by-term',
    templateUrl: './products-by-term.component.html',
    styleUrls: ['./products-by-term.component.scss']
})
export class ProductsByTermComponent implements OnInit, OnDestroy {
    private isAlive = false
    public products: Observable<Product[]>

    constructor(
        private productService: ProductService,
        public activatedRoute: ActivatedRoute
    ) { }

    public ngOnInit(): void {
        this.isAlive = true

        this.activatedRoute.paramMap
            .takeWhile(() => this.isAlive)
            .subscribe((paramMap) => {
                const taxonomySlug = paramMap.get('taxonomySlug')
                const taxonomyTermSlug = paramMap.get('taxonomyTermSlug')

                if (!this.products) {
                    this.products = this.productService.getSource
                }
                this.productService.get(new GetProductsRequest({
                    filters: [
                        {
                            type: 'taxonomy',
                            key: taxonomySlug,
                            values: [ taxonomyTermSlug ]
                        }
                    ]
                }))
            })
    }

    public ngOnDestroy(): void {
        this.isAlive = false
    }

    public getGridContainerClasses(): string[] {
        const identifiers = [ 'products-grid-container' ]
        const bootstrapLayoutClasses = [ 'col-12' ]
        return [
            ...bootstrapLayoutClasses,
            ...identifiers,
        ]
    }
}
