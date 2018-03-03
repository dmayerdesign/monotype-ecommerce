import { Injectable } from '@angular/core'
import { cloneDeep } from 'lodash'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'

import { LocalStorageKeys } from '@mte/common/constants/local-storage-keys'
import { Cart } from '@mte/common/models/api-models/cart'
import { Price } from '@mte/common/models/api-models/price'
import { Product } from '@mte/common/models/api-models/product'
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
    private cart: Cart
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
        const cart = <Cart>this.util.getFromLocalStorage(LocalStorageKeys.Cart)
        if (cart) {
            this.populateAndStream(cart)
        }
        this.userService.users.subscribe((user) => {
            if (user && user.cart && user.cart.items) {
                if (user.cart.items.length || user.cart.discounts.length) {
                    this.populateAndStream(user.cart)
                }
            }
        })
    }

    public add(slug: string, quantity = 1): void {
        const newCart = _.cloneDeep(this.cart)
        this.previousState = _.cloneDeep(this.cart)

        this.productService.getOneSource.subscribe(product => {
            const amtToAdd: number = product.stockQuantity >= quantity ? quantity : product.stockQuantity
            for (let i = 0; i < amtToAdd; i++) {
                newCart.items.push(product)
            }

            this.populateAndStream(newCart)
        })
        this.productService.getOne(slug)
    }

    private populateAndStream(newCart: Cart, refreshProducts = true): void {
        newCart.subTotal = this.getSubTotal(<Product[]>newCart.items)
        newCart.total = this.getTotal(<Product[]>newCart.items)
        if (refreshProducts) {
            this.productService.getSome(newCart.items.map((item: Product) => item._id))
                .subscribe(products => {
                    newCart.items = products
                    newCart.displayItems = this.getDisplayItems(products)
                    this.cart = newCart
                    this.cartPump.next(this.cart)
                })
        }
        else {
            this.cart = newCart
            this.cartPump.next(this.cart)
        }
    }

    public remove(slug: string): void {
        const newCart = _.cloneDeep(this.cart)
        this.previousState = _.cloneDeep(this.cart)
        newCart.items.splice(newCart.items.findIndex((i: Product) => i.slug === slug), 1)

        this.populateAndStream(newCart)
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
        return this.getSubTotal(items) * this.orgService.organization.retailSettings.salesTaxPercentage / 100
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
