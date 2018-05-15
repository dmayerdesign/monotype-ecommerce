import { Component, OnDestroy, OnInit } from '@angular/core'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { Cart } from '@mte/common/models/api-models/cart'
import { Product } from '@mte/common/models/api-models/product'
import { capitalize } from 'lodash'
import { takeWhile } from 'rxjs/operators/takeWhile'
import { CartService } from '../../../shared/services/cart.service'
import { OrganizationService } from '../../../shared/services/organization.service'
import { UiService } from '../../../shared/services/ui.service'
import { ProductService } from '../../services/product.service'

@Component({
    selector: 'mte-cart',
    template: `
        <div class="container page-container">
            <h1>{{ capitalize(organizationService.organization.branding.cartName) || 'Your Cart' }}</h1>
            <div *ngFor="let item of cart?.items">
                <h3 *ngIf="productNamesMap.has(item)">{{ productNamesMap.get(item) }}</h3>
                <button (click)="cartService.removeAll(item.slug)">Remove</button>
            </div>
        </div>
    `,
    styleUrls: ['./cart.component.scss']
})
@Heartbeat()
export class CartComponent extends HeartbeatComponent implements OnInit, OnDestroy {
    public productNamesMap = new WeakMap<Product, string>()
    public cart: Cart
    public capitalize = capitalize

    constructor(
      public cartService: CartService,
      public productService: ProductService,
      public organizationService: OrganizationService,
      public uiService: UiService,
    ) { super() }

    public ngOnInit(): void {
        this.cartService.carts
            .pipe(takeWhile(() => this.isAlive))
            .subscribe((cart) => {
                this.cart = cart
                cart.items.forEach((item: Product) => {
                    this.productNamesMap.set(item, this.productService.getName(item))
                })
            })

        this.uiService.setTitle(capitalize(this.organizationService.organization.branding.cartName))
    }

    public ngOnDestroy(): void { }
}
