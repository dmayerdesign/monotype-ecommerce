import { NgForOfContext } from '@angular/common'
import { Component, ContentChild, Input, TemplateRef } from '@angular/core'
import { ImageHelper } from '@mte/common/helpers/image.helper'
import { Product } from '@mte/common/models/api-models/product'
import { Observable } from 'rxjs/Observable'
import { ProductService } from '../../services'

@Component({
    selector: 'mte-products-grid',
    templateUrl: './products-grid.component.html',
    styleUrls: ['./products-grid.component.scss'],
})
export class ProductsGridComponent {
    @Input() public products: Observable<Product[]>

    public imageHelper = ImageHelper

    constructor(
        public productService: ProductService
    ) {}

    public getProductContainerClasses(): string[] {
        const identifiers = [ 'grid-product' ]
        const bootstrapLayoutClasses = [ 'col-lg-3', 'col-md-4', 'col-sm-6', 'col-xs-12' ]

        return [
            ...identifiers,
            ...bootstrapLayoutClasses,
        ]
    }
}
