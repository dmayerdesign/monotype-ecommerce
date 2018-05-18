import { Injectable } from '@angular/core'
import { LocalStorageKeys } from '@mte/common/constants/local-storage-keys'
import { Action } from '@mte/common/lib/state-manager/action'
import { Reducer } from '@mte/common/lib/state-manager/reducer'
import { Store } from '@mte/common/lib/state-manager/store'
import { Cart } from '@mte/common/models/api-models/cart'
import { Price } from '@mte/common/models/api-models/price'
import { Product } from '@mte/common/models/api-models/product'
import { Currency } from '@mte/common/models/enums/currency'
import { CartProduct } from '@mte/common/models/interfaces/ui/cart-product'
import { cloneDeep } from 'lodash'
import { Observable, ReplaySubject } from 'rxjs'
import { map } from 'rxjs/operators'
import { ProductService } from '../../../shop/services/product.service'
import { OrganizationService } from '../organization.service'
import { UserService } from '../user.service'
import { UtilService } from '../util.service'
import { CartItemsUpdate, CartItemAddition, CartItemQuantityDecrement, CartItemQuantityIncrement, CartItemRemoval, CartUpdate } from './cart.actions'
import { cartReducer } from './cart.reducer'
import { CartState } from './cart.state'

@Injectable({
    providedIn: 'root'
})
export class CartService {
    public store: Store<CartState>

    constructor(
        private util: UtilService,
        private productService: ProductService,
        private orgService: OrganizationService,
        private userService: UserService,
    ) {
        this.store = new Store<CartState>(new CartState(), cartReducer)
        this.orgService.organizations.subscribe(org => {
            this.init()
        })
    }

    public get cart(): Cart {
        return this.store.state as Cart
    }

    public init(): void {
        // Register side effects.
        this.store.actions.subscribe(() => this.updateAndStream())

        // Set state.
        /// Check local storage.
        const cart = this.util.getFromLocalStorage(LocalStorageKeys.Cart) as Cart
        if (cart && (!!cart.items || !!cart.discounts)) {
            if (cart.items.length || cart.discounts.length) {
                this.store.dispatch(new CartUpdate(cart))
            }
        }
        /// Check user.
        this.userService.users.subscribe((user) => {
            if (user && user.cart && (!!user.cart.items || !!user.cart.discounts)) {
                if (user.cart.items.length || user.cart.discounts.length) {
                    this.store.dispatch(new CartUpdate(user.cart))
                }
            }
        })
    }

    public add(slug: string, quantity = 1): Observable<Cart> {
        const getOneSource = this.productService.getOne(slug)
        getOneSource.subscribe((product) => {
            this.store.dispatch(new CartItemAddition({ item: product, quantity }))
        })
        return getOneSource.pipe(map(() => this.cart))
    }

    public incrementQuantity(item: Product, direction: 1|-1): Observable<boolean> {
        if (direction === 1) {
            return this.store.dispatch(new CartItemQuantityIncrement(item))
        }
        else if (direction === -1) {
            return this.store.dispatch(new CartItemQuantityDecrement(item))
        }
    }

    public remove(item: Product): void {
        this.store.dispatch(new CartItemRemoval(item))
    }

    private updateAndStream(): void {
        this.productService.getSome(this.cart.items.map((item: Product) => item._id))
            .subscribe(products => {
                this.userService.updateCart(this.cart)
                this.util.saveToLocalStorage(LocalStorageKeys.Cart, this.cart)
            })
    }
}
