import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Cart } from '@mte/common/api/interfaces/cart'
import { CartItem } from '@mte/common/api/interfaces/cart-item'
import { GetCartItemsFromIdsRequest } from '@mte/common/api/requests/get-cart-items-from-ids.request'
import { ApiEndpoints } from '@mte/common/constants'
import { LocalStorageKeys } from '@mte/common/constants/local-storage-keys'
import { CartItemsUpdate, CartItemAddition, CartItemQuantityDecrement, CartItemQuantityIncrement, CartItemRemoval, CartUpdate } from '../stores/cart/cart.actions'
import { CartStore } from '../stores/cart/cart.store'
import { OrganizationService } from './organization.service'
import { UserService } from './user.service'
import { UtilService } from './util.service'

@Injectable({ providedIn: 'root' })
export class CartService {
    constructor(
        private _util: UtilService,
        private _httpClient: HttpClient,
        private _organizationService: OrganizationService,
        private _userService: UserService,
        private _cartStore: CartStore
    ) {
        this._organizationService.organizations.subscribe(() => this.init())
    }

    public get cart(): Cart {
        return this._cartStore.state as Cart
    }

    public init(): void {

        // Register side effects.

        // Any time the cart changes, make sure its items are up-to-date.
        this._cartStore.reactTo([CartItemsUpdate], true)
            .subscribe(() => this._reactToAllButCartItemsUpdate())

        // Any time the cart items change, persist the changes.
        this._cartStore.reactTo([CartItemsUpdate])
            .subscribe(() => this._reactToCartItemsUpdate())

        // Set state.

        // Check local storage.
        const cart = this._util.getFromLocalStorage(LocalStorageKeys.Cart) as Cart
        if (cart && (!!cart.items || !!cart.discounts)) {
            if (cart.items.length || cart.discounts.length) {
                this._cartStore.dispatch(new CartUpdate(cart))
            }
        }

        // Check user.
        this._userService.users.subscribe((user) => {
            if (user && user.cart && (!!user.cart.items || !!user.cart.discounts)) {
                if (user.cart.items.length || user.cart.discounts.length) {
                    this._cartStore.dispatch(new CartUpdate(user.cart))
                }
            }
        })
    }

    public async add(id: string, quantity = 1): Promise<Cart> {
        try {
            const item: CartItem = await this._getItem(id)
            this._cartStore.dispatch(new CartItemAddition({ item, quantity }))
        }
        catch (error) {
            console.log('Could not find the item in the database.')
        }
        return this.cart
    }

    public incrementQuantity(item: CartItem, direction: 1|-1): void {
        if (direction === 1) {
            this._cartStore.dispatch(new CartItemQuantityIncrement(item))
        }
        else if (direction === -1) {
            this._cartStore.dispatch(new CartItemQuantityDecrement(item))
        }
    }

    public remove(item: CartItem): void {
        this._cartStore.dispatch(new CartItemRemoval(item))
    }

    // API calls.

    private async _getItem(id: string): Promise<CartItem> {
        return this._httpClient.get<CartItem>(`${ApiEndpoints.Cart}/get-item/${id}`)
        .toPromise()
    }

    private async _reactToAllButCartItemsUpdate(): Promise<void> {
        const ids = this.cart.items.map((item: CartItem) => item._id)
        const request = new GetCartItemsFromIdsRequest({ ids })
        const params = new HttpParams()
            .set('request', JSON.stringify(request))

        const items = await this._httpClient
            .get<CartItem[]>(`${ApiEndpoints.Cart}/refresh`, { params })
            .toPromise()

        await this._cartStore.dispatch(new CartItemsUpdate({
            items,
            addSalesTax: this._organizationService.organization.retailSettings.addSalesTax,
            salesTaxPercentage: this._organizationService.organization.retailSettings.salesTaxPercentage
        }))
    }

    private _reactToCartItemsUpdate(): void {
        this._userService.updateCart(this.cart)
        this._util.saveToLocalStorage(LocalStorageKeys.Cart, this.cart)
    }
}
