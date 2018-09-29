import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Cart } from '@mte/common/api/interfaces/cart'
import { CartItem } from '@mte/common/api/interfaces/cart-item'
import { ApiEndpoints } from '@mte/common/constants'
import { LocalStorageKeys } from '@mte/common/constants/local-storage-keys'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { filter, switchMap, take } from 'rxjs/operators'
import { AppState } from '../../state/app.state'
import { CartAction, CartItemAddition, CartItemAdditionSuccess, CartItemQuantityDecrement, CartItemQuantityIncrement, CartItemRemoval, CartUpdate } from '../modules/cart/cart.actions'
import { CartState } from '../modules/cart/cart.state'
import { SharedModule } from '../shared.module'
import { OrganizationService } from './organization.service'
import { UserService } from './user.service'
import { UtilService } from './util.service'

@Injectable({ providedIn: SharedModule })
export class CartService {
    private _cart: CartState

    constructor(
        private _util: UtilService,
        private _httpClient: HttpClient,
        private _organizationService: OrganizationService,
        private _userService: UserService,
        private _store: Store<AppState>,
        private _actions: Actions<CartAction>
    ) {
        this._organizationService.organizations.subscribe(() => this.init())
        this._store.select('cart').subscribe((cartState) => this._cart = cartState)
    }

    public get cart(): Cart {
        return this._cart
    }

    public init(): void {

        // Set state.

        // Check local storage.
        const cart = this._util.getFromLocalStorage(LocalStorageKeys.Cart) as Cart
        if (cart && (!!cart.items || !!cart.discounts)) {
            if (cart.items.length || cart.discounts.length) {
                this._store.dispatch(new CartUpdate(cart))
            }
        }

        // Check user.
        this._userService.users.subscribe((user) => {
            if (user && user.cart && (!!user.cart.items || !!user.cart.discounts)) {
                if (user.cart.items.length || user.cart.discounts.length) {
                    this._store.dispatch(new CartUpdate(user.cart))
                }
            }
        })
    }

    public async add(id: string, quantity = 1): Promise<Cart> {
        const item: CartItem = await this._getItem(id)
        this._store.dispatch(new CartItemAddition({ item, quantity }))
        return this._actions.pipe(
            filter((action) => action instanceof CartItemAdditionSuccess),
            switchMap(() => this._store.select('cart')),
            take(1),
        ).toPromise()
    }

    public incrementQuantity(item: CartItem, direction: 1|-1): void {
        if (direction === 1) {
            this._store.dispatch(new CartItemQuantityIncrement(item))
        }
        else if (direction === -1) {
            this._store.dispatch(new CartItemQuantityDecrement(item))
        }
    }

    public remove(item: CartItem): void {
        this._store.dispatch(new CartItemRemoval(item))
    }

    // API calls.

    private async _getItem(id: string): Promise<CartItem> {
        return this._httpClient.get<CartItem>(`${ApiEndpoints.Cart}/get-item/${id}`)
            .toPromise()
    }
}
