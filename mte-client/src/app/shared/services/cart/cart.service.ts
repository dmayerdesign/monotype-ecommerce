import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApiEndpoints } from '@mte/common/constants'
import { LocalStorageKeys } from '@mte/common/constants/local-storage-keys'
import { Store } from '@mte/common/lib/state-manager/store'
import { Cart } from '@mte/common/models/api-interfaces/cart'
import { CartItem } from '@mte/common/models/api-interfaces/cart-item'
import { GetCartItemsFromIdsRequest } from '@mte/common/models/api-requests/get-cart-items-from-ids.request'
import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import { OrganizationService } from '../organization.service'
import { UserService } from '../user.service'
import { UtilService } from '../util.service'
import { CartItemsUpdate, CartItemAddition, CartItemQuantityDecrement, CartItemQuantityIncrement, CartItemRemoval, CartTotalUpdate, CartUpdate } from './cart.actions'
import { cartReducer } from './cart.reducer'
import { CartState } from './cart.state'

@Injectable({ providedIn: 'root' })
export class CartService {
    public store: Store<CartState>

    constructor(
        private _util: UtilService,
        private _httpClient: HttpClient,
        private _organizationService: OrganizationService,
        private _userService: UserService,
    ) {
        this.store = new Store<CartState>(new CartState(), cartReducer)
        this._organizationService.organizations.subscribe(org => {
            this.init()
        })
    }

    public get cart(): Cart {
        return this.store.state as Cart
    }

    public init(): void {

        // Register side effects.

        this.store.actions
            .pipe(
                filter((action) =>
                    !(action instanceof CartTotalUpdate) &&
                    !(action instanceof CartItemsUpdate)
                )
            )
            .subscribe(() => this.updateAndStream())

        // Set state.

        /// Check local storage.
        const cart = this._util.getFromLocalStorage(LocalStorageKeys.Cart) as Cart
        if (cart && (!!cart.items || !!cart.discounts)) {
            if (cart.items.length || cart.discounts.length) {
                this.store.dispatch(new CartUpdate(cart))
            }
        }

        /// Check user.
        this._userService.users.subscribe((user) => {
            if (user && user.cart && (!!user.cart.items || !!user.cart.discounts)) {
                if (user.cart.items.length || user.cart.discounts.length) {
                    this.store.dispatch(new CartUpdate(user.cart))
                }
            }
        })
    }

    public async add(id: string, quantity = 1): Promise<Cart> {
        try {
            const item: CartItem = await this.getItem(id)
            this.store.dispatch(new CartItemAddition({ item, quantity }))
        }
        catch (error) {
            console.log('Could not find the item in the database.')
        }
        return this.cart
    }

    public incrementQuantity(item: CartItem, direction: 1|-1): Observable<boolean> {
        if (direction === 1) {
            return this.store.dispatch(new CartItemQuantityIncrement(item))
        }
        else if (direction === -1) {
            return this.store.dispatch(new CartItemQuantityDecrement(item))
        }
    }

    public remove(item: CartItem): void {
        this.store.dispatch(new CartItemRemoval(item))
    }

    // API calls.

    private async getItem(id: string): Promise<CartItem> {
        return this._httpClient.get<CartItem>(`${ApiEndpoints.Cart}/get-item/${id}`)
        .toPromise()
    }

    private async updateAndStream(): Promise<void> {
        const ids = this.cart.items.map((item: CartItem) => item._id)
        const request = new GetCartItemsFromIdsRequest({ ids })
        const params = new HttpParams()
            .set('request', JSON.stringify(request))

        this._httpClient.get<CartItem[]>(`${ApiEndpoints.Cart}/refresh`, { params })
            .subscribe((items) => {
                this.store.dispatch(new CartItemsUpdate(items))
                const subTotal = this.cart.subTotal
                const total = {
                    amount: subTotal.amount + (subTotal.amount * this._organizationService.organization.retailSettings.salesTaxPercentage / 100),
                    currency: subTotal.currency,
                }
                this.store.dispatch(new CartTotalUpdate(total))
                    .subscribe(() => {
                        this._userService.updateCart(this.cart)
                        this._util.saveToLocalStorage(LocalStorageKeys.Cart, this.cart)
                    })
            })
    }
}
