import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { CartItem } from '@mte/common/api/interfaces/cart-item'
import { Product } from '@mte/common/api/interfaces/product'
import { GetCartItemsFromIdsRequest } from '@mte/common/api/requests/get-cart-items-from-ids.request'
import { ApiEndpoints, LocalStorageKeys } from '@mte/common/constants'
import { Actions, Effect } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { filter, map, mergeMap, switchMap, take, tap } from 'rxjs/operators'
import { OrganizationService } from '../services/organization.service'
import { UserService } from '../services/user.service'
import { UtilService } from '../services/util.service'
import { AppState } from '../state/app.state'
import { CartAction, CartItemsUpdate, CartItemsUpdateSuccess } from './cart.actions'
import { cartSelectorKey } from './cart.selectors'

@Injectable()
export class CartEffects {

    @Effect()
    public cartItemsUpdates: Observable<CartItemsUpdate> = this._actions
        .pipe(
            filter((action) =>
                !(action instanceof CartItemsUpdate) &&
                !(action instanceof CartItemsUpdateSuccess)),
            switchMap(() => this._store.select(cartSelectorKey).pipe(take(1))),
            mergeMap((cartState) => {
                const ids = cartState.items.map((item: CartItem) => item._id)
                const request = new GetCartItemsFromIdsRequest({ ids })
                const params = new HttpParams()
                    .set('request', JSON.stringify(request))

                return this._httpClient
                    .get<CartItem[]>(`${ApiEndpoints.Cart}/refresh`, { params })
                    .pipe(
                        switchMap(() => this._organizationService.organizations.pipe(take(1))),
                        filter((organization) => !!organization),
                        map((organization) =>
                            new CartItemsUpdate({
                                items: cartState.items as Product[],
                                addSalesTax: organization.retailSettings.addSalesTax,
                                salesTaxPercentage: organization.retailSettings.salesTaxPercentage
                            })
                        )
                    )
            })
        )

    @Effect()
    public cartItemsUpdateSuccesses: Observable<CartItemsUpdateSuccess> = this._actions
        .pipe(
            filter((action) => action instanceof CartItemsUpdate),
            switchMap(() => this._store.select(cartSelectorKey).pipe(take(1))),
            mergeMap((cartState) => {
                this._utilService.saveToLocalStorage(LocalStorageKeys.Cart, cartState)
                return this._userService.updateCart(cartState)
                    .pipe(
                        map((cart) => new CartItemsUpdateSuccess(cart))
                    )
            })
        )

    constructor(
        private _store: Store<AppState>,
        private _actions: Actions<CartAction>,
        private _httpClient: HttpClient,
        private _organizationService: OrganizationService,
        private _utilService: UtilService,
        private _userService: UserService,
    ) { }
}
