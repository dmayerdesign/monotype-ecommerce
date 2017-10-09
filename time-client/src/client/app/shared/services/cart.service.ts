import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'

import { ICart, ICartProduct, IProduct } from '@time/common/models/interfaces'
import { ProductService } from '../../shop/services'
import { OrganizationService } from '../services'
import { UtilService } from './util.service'

@Injectable()
export class CartService {
    private previousState: ICart
    private initialState: ICart = {
        count: 0,
        items: [],
        displayItems: [],
        subTotal: 0,
        total: 0,
        discounts: [],
    }
    private cart = { ...this.initialState }
    private cartSubject = new ReplaySubject<ICart>()
    public cart$: Observable<ICart>

    constructor(
        private util: UtilService,
        private productService: ProductService,
        private orgService: OrganizationService,
    ) {
        this.orgService.organization$.subscribe(org => {
            this.init()
        })
    }

    public init() {
        this.cart = <ICart>this.util.getFromLocalStorage('shared.cart')
        this.cart$ = this.cartSubject.asObservable()
        this.cartSubject.next(this.cart)
    }

    public add(slug: string, quantity = 1): void {
        const newCart = { ...this.cart }
        this.previousState = { ...this.cart }

        this.productService.getOne(slug).subscribe(product => {
            const amtToAdd: number = product.stockQuantity >= quantity ? quantity : product.stockQuantity
            for (let i = 0; i < amtToAdd; i++) {
                newCart.items.push(product)
            }

            this.populateAndStream(newCart)
        })
    }

    private populateAndStream(newCart: ICart) {
        newCart.total = this.getTotal(newCart.items)
        newCart.displayItems = this.getDisplayItems(newCart.items)
        this.cart = newCart
        this.cartSubject.next(this.cart)
    }

    public remove(slug: string) {
        const newCart = { ...this.cart }
        this.previousState = { ...this.cart }
        newCart.items.splice(newCart.items.findIndex(i => i.slug === slug), 1)

        this.populateAndStream(newCart)
    }

    private getSubTotal(items: IProduct[]): number {
        return items
            .map(p => {
                return this.productService.getPrice(p).total
            })
            .reduce((prev: number, current: number) => {
                return prev + current
            }, 0)
    }

    private getTotal(items: IProduct[]): number {
        return this.getSubTotal(items) * this.orgService.organization.retailSettings.salesTaxPercentage
    }

    public getDisplayItems(items: IProduct[]): ICartProduct[] {
        const displayItems: ICartProduct[] = []
        items.forEach(item => {
            const indexOfSame = displayItems.findIndex(x => x.product.slug === item.slug)
            if (indexOfSame > -1) {
                displayItems[indexOfSame].quantity += 1
                displayItems[indexOfSame].subTotal.total += this.productService.getPrice(item).total
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
