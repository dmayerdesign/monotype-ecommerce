import { NgForOfContext } from '@angular/common'
import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core'
import { ImageHelper } from '@mte/common/helpers/image.helper'
import { Product } from '@mte/common/models/api-interfaces/product'
import { Observable } from 'rxjs'
import { ProductService } from '../../services/product.service'

@Component({
    selector: 'mte-products-grid',
    templateUrl: './products-grid.component.html',
    styleUrls: ['./products-grid.component.scss'],
})
export class ProductsGridComponent {
    @Input() public products: Observable<Product[]>
    @Output() public productClick = new EventEmitter<Product>()

    public imageHelper = ImageHelper

    constructor(
        public productService: ProductService
    ) {}

    public getProductContainerClasses(): string[] {
        const identifiers = [ 'grid-product' ]
        const bootstrapLayoutClasses = [ 'col-lg-4', 'col-md-4', 'col-sm-6', 'col-xs-12' ]

        return [
            ...identifiers,
            ...bootstrapLayoutClasses,
        ]
    }
}
