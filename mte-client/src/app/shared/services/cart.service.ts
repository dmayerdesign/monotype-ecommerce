import { Injectable } from '@angular/core'
import { cloneDeep } from 'lodash'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { map } from 'rxjs/operators/map'

import { LocalStorageKeys } from '@mte/common/constants/local-storage-keys'
import { Cart } from '@mte/common/models/api-models/cart'
import { Price } from '@mte/common/models/api-models/price'
import { Product } from '@mte/common/models/api-models/product'
import { Currency } from '@mte/common/models/enums/currency'
import { CartProduct } from '@mte/common/models/interfaces/ui/cart-product'
import { ProductService } from '../../shop/services/product.service'
import { OrganizationService } from './organization.service'
import { UserService } from './user.service'
import { UtilService } from './util.service'

@Injectable()
export class CartService {
    private previousState: Cart
    private initialState: Cart = {
        count: 0,
        items: [],
        displayItems: [],
        subTotal: 0,
        total: 0,
        discounts: [],
    }
    private _cart: Cart
    private cartPump = new ReplaySubject<Cart>(1)
    public carts = this.cartPump.asObservable()

    constructor(
        private util: UtilService,
        private productService: ProductService,
        private orgService: OrganizationService,
        private userService: UserService,
    ) {
        this.cart = cloneDeep(this.initialState)
        this.orgService.organizations.subscribe(org => {
            this.init()
        })
    }

    public init(): void {

        // FOR TESTING
            // this.updateAndStream({
            //     items: [ { price: { amount: 5 } }, { price: { amount: 5 } } ] as Product[],
            //     displayItems: [],
            //     price: {
            //         amount: 10,
            //         currency: Currency.USD
            //     },
            //     count: 2,
            //     subTotal: 10,
            //     total: 10,
            //     discounts: []
            // } as Cart, false)
        //

        const cart = this.util.getFromLocalStorage(LocalStorageKeys.Cart) as Cart
        if (cart) {
            this.updateAndStream(cart)
        }
        this.userService.users.subscribe((user) => {
            if (user && user.cart && user.cart.items) {
                if (user.cart.items.length || user.cart.discounts.length) {
                    this.updateAndStream(user.cart)
                }
            }
        })
    }

    private set cart(cart: Cart) {
        this._cart = {
            ...cart,
            displayItems: this.getDisplayItems(cart.items as Product[])
        }
    }

    private get cart(): Cart {
        return this._cart
    }

    public add(slug: string, quantity = 1): Observable<Cart> {
        const newCart = cloneDeep(this.cart)
        this.previousState = cloneDeep(this.cart)

        const getOneSource = this.productService.getOne(slug)
        getOneSource.subscribe((product) => {
            const productsAvailable = this.getNumberAvailableToAdd(product)
            const amtToAdd = productsAvailable >= quantity ? quantity : productsAvailable
            for (let i = 0; i < amtToAdd; i++) {
                newCart.items.push(product)
            }
            this.updateAndStream(newCart)
        })
        return getOneSource.pipe(map(() => this.cart))
    }

    public incrementQuantity(product: Product, direction: 1|-1): boolean {
        if (direction === 1) {
            const numberAvailable = this.getNumberAvailableToAdd(product)
            if (!!numberAvailable) {
                this.add(product.slug, 1)
                return true
            }
        }
        else if (direction === -1) {
            this.remove(product.slug)
        }
        return false
    }

    public remove(slug: string): void {
        const newCart = cloneDeep(this.cart)
        this.previousState = cloneDeep(this.cart)
        this.removeOne(slug, newCart)
        this.updateAndStream(newCart)
    }

    public removeAll(slug: string): void {
        const newCart = cloneDeep(this.cart)
        this.previousState = cloneDeep(this.cart)
        while (newCart.items.findIndex((item: Product) => item.slug === slug) > -1) {
            this.removeOne(slug, newCart)
        }
        this.updateAndStream(newCart)
    }

    public getNumberAvailableToAdd(product: Product): number {
        return product.stockQuantity - this.cart.items.filter((item: Product) => item._id === product._id).length
    }

    private removeOne(slug: string, cart: Cart): void {
        cart.items.splice(cart.items.findIndex((i: Product) => i.slug === slug), 1)
    }

    private updateAndStream(newCart: Cart, refreshProducts = true): void {
        const saveAndStream = (cart) => {
            this.userService.updateCart(this.cart)
            this.cart = cart
            this.cartPump.next(this.cart)
            this.util.saveToLocalStorage(LocalStorageKeys.Cart, this.cart)
        }

        newCart.count = newCart.items.length
        newCart.subTotal = this.getSubTotal(newCart.items as Product[])
        newCart.total = this.getTotal(newCart.items as Product[])

        if (refreshProducts) {
            this.productService.getSome(newCart.items.map((item: Product) => item._id))
                .subscribe(products => {
                    newCart.items = products
                    saveAndStream(newCart)
                })
        }
        else {
            saveAndStream(newCart)
        }
    }

    private getSubTotal(items: Product[]): number {
        return items
            .map(p => {
                return this.productService.getPrice(p).amount
            })
            .reduce((prev: number, current: number) => {
                return prev + current
            }, 0)
    }

    private getTotal(items: Product[]): number {
        const subTotal = this.getSubTotal(items)
        return subTotal + (subTotal * this.orgService.organization.retailSettings.salesTaxPercentage / 100)
    }

    private getDisplayItems(items: Product[]): CartProduct[] {
        const displayItems: CartProduct[] = []

        items.forEach(item => {
            const duplicateItemIndex = displayItems.findIndex(displayItem => displayItem.product._id === item._id)

            if (duplicateItemIndex > -1) {
                const duplicateItem = displayItems.find(displayItem => displayItem.product._id === item._id)

                displayItems[duplicateItemIndex] = {
                    ...duplicateItem,
                    quantity: duplicateItem.quantity + 1,
                    subTotal: {
                        amount: duplicateItem.subTotal.amount + this.productService.getPrice(item).amount,
                        currency: duplicateItem.subTotal.currency,
                    } as Price,
                }
            }
            else {
                displayItems.push({
                    quantity: 1,
                    product: item,
                    subTotal: this.productService.getPrice(item),
                })
            }
        })

        return displayItems
    }
}
