import { Injectable } from '@angular/core'
import { IProduct } from '@time/common/models/interfaces'
import { Cart } from './cart'

@Injectable()
export class CartService {

    private initialState = new Cart()
    public state = { ...this.initialState }

    constructor() {
        this.init()
    }

    public init(): void {

    }

    public add(product: IProduct, quantity = 1) {
        console.log("Adding", product, quantity)
    }
}
