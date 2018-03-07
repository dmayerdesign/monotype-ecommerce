import { Component, Input, OnInit } from '@angular/core'
import { Product } from '@mte/common/models/api-models/product'
import { WindowRefService } from '@mte/common/ng-modules/ui/services/window-ref.service'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { ProductService } from '../../services'

@Component({
    selector: 'mte-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
    @Input() public title = 'Shop'
    public products: Observable<Product[]>
    public leftSidebarIsExpandeds: BehaviorSubject<boolean>

    constructor(
        private productService: ProductService,
        public windowRef: WindowRefService
    ) { }

    public ngOnInit(): void {
        this.products = this.productService.getSource
        this.productService.get()
        this.leftSidebarIsExpandeds = new BehaviorSubject(this.windowRef.mediaBreakpointAbove('lg'))
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
