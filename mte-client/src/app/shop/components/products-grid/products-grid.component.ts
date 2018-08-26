import { Component, EventEmitter, Input, Output } from '@angular/core'
import { Product } from '@mte/common/api/interfaces/product'
import { Observable } from 'rxjs'

@Component({
    selector: 'mte-products-grid',
    templateUrl: './products-grid.component.html',
    styleUrls: ['./products-grid.component.scss'],
})
export class ProductsGridComponent {
    @Input() public productsStream: Observable<Product[]>
    @Output() public productClick = new EventEmitter<Product>()
}
