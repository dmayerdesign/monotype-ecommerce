import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import * as stripe from 'stripe'

@Injectable()
export class PaymentServiceProviderService {

    constructor(private http: HttpClient) { }

    public getStripeCustomer(id: string): Observable<stripe.customers.ICustomer> {
        return this.http.get<stripe.customers.ICustomer>(`/api/stripe/customer/${id}`)
    }
}
