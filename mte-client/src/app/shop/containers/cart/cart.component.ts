import { Component, OnDestroy, OnInit } from '@angular/core'
import { ProductHelper } from '@mte/common/helpers/product.helper'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { Cart } from '@mte/common/models/api-interfaces/cart'
import { Product } from '@mte/common/models/api-interfaces/product'
import { capitalize } from 'lodash'
import { takeWhile } from 'rxjs/operators'
import { CartService } from '../../../shared/services/cart/cart.service'
import { OrganizationService } from '../../../shared/services/organization.service'
import { UiService } from '../../../shared/services/ui.service'

@Component({
    selector: 'mte-cart',
    template: `
        <div class="container page-container">
            <h1>{{ capitalize(organizationService.organization.branding.cartName) || 'Your Cart' }}</h1>
            <div *ngFor="let item of cart?.items">
                <h3 *ngIf="productNamesMap.has(item)">{{ productNamesMap.get(item) }}</h3>
                <button (click)="cartService.remove(item)">Remove</button>
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
      public organizationService: OrganizationService,
      public uiService: UiService,
    ) { super() }

    public ngOnInit(): void {
        this.cartService.store.states
            .pipe(takeWhile(() => this.isAlive))
            .subscribe((cart: Cart) => {
                this.cart = cart
                cart.items.forEach((item: Product) => {
                    this.productNamesMap.set(item, ProductHelper.getName(item))
                })
            })

        this.uiService.setTitle(capitalize(this.organizationService.organization.branding.cartName))
    }

    public ngOnDestroy(): void { }
}
