import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

import { AppConfig } from '@mte/app-config'
import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { Order } from '@mte/common/models/api-models/order'

@Injectable()
export class CheckoutService {

    constructor (
        private http: HttpClient,
    ) {}

    public checkout(order: Order): Observable<any> {
        return this.http.post(`${ApiEndpoints.Orders}/execute`, order)
    }

    public get stripeKey(): string {
        return AppConfig.stripe_publishable_key
    }

    public getStripeCustomer(id: string): Observable<any> {
        return this.http.get(`/api/stripe/customer/${id}`)
    }

}
