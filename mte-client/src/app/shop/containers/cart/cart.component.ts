import { Component, OnDestroy, OnInit } from '@angular/core'
import { Cart } from '@mte/common/api/interfaces/cart'
import { CartItem } from '@mte/common/api/interfaces/cart-item'
import { ProductHelper } from '@mte/common/helpers/product.helper'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { Store } from '@ngrx/store'
import { capitalize } from 'lodash'
import { takeWhile } from 'rxjs/operators'
import { cartSelectorKey } from '../../../cart/cart.selectors'
import { CartService } from '../../../cart/cart.service'
import { OrganizationService } from '../../../services/organization.service'
import { UiService } from '../../../services/ui.service'
import { AppState } from '../../../state/app.state'

@Component({
    selector: 'mte-cart',
    template: `
        <div class="container page-container">
            <div id="cart">
                <h1>{{ capitalize(organizationService.organization.branding.cartName) || 'Your Cart' }}</h1>
                <div *ngFor="let item of cart?.items">
                    <h3>
                        <ng-container *ngIf="itemNamesMap.has(item); then productName; else productSlug"></ng-container>
                        <ng-template #productName>{{ itemNamesMap.get(item) }}</ng-template>
                        <ng-template #productSlug>{{ item.slug }}</ng-template>
                    </h3>
                    <button (click)="cartService.remove(item)">Remove</button>
                </div>
            </div>
            <div id="checkout">
                <mte-checkout></mte-checkout>
            </div>
        </div>
    `,
    styleUrls: ['./cart.component.scss']
})
@Heartbeat()
export class CartComponent extends HeartbeatComponent implements OnInit, OnDestroy {
    public itemNamesMap = new WeakMap<CartItem, string>()
    public cart: Cart
    public capitalize = capitalize

    constructor(
      public cartService: CartService,
      public organizationService: OrganizationService,
      public uiService: UiService,
      private _store: Store<AppState>,
    ) { super() }

    public ngOnInit(): void {
        this._store.select(cartSelectorKey)
            .pipe(takeWhile(() => this.isAlive))
            .subscribe((cart) => {
                this.cart = cart
                cart.items.forEach((item: CartItem) => {
                    if (ProductHelper.isProduct(item)) {
                        this.itemNamesMap.set(item, ProductHelper.getName(item))
                    } else {
                        this.itemNamesMap.set(item, item.name)
                    }
                })
            })

        this.uiService.setTitle(capitalize(this.organizationService.organization.branding.cartName))
    }

    public ngOnDestroy(): void { }
}
