import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'

import { AppConfig } from '@time/app-config'
import { Endpoints } from '@time/common/constants/endpoints'
import { Order } from '@time/common/models/api-models/order'

@Injectable()
export class CheckoutService {

    constructor (
        private http: HttpClient,
    ) {}

    public checkout(order: Order): Observable<any> {
        return this.http.post(`${Endpoints.Orders}/execute`, order)
    }

    public get stripeKey(): string {
        return AppConfig.stripe_publishable_key
    }

    public getStripeCustomer(id: string): Observable<any> {
        return this.http.get(`/api/stripe/customer/${id}`)
    }

}
