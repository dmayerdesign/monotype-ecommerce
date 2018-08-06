import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import {} from 'stripe'

@Injectable({ providedIn: 'root' })
export class PaymentServiceProviderService {

    constructor (private http: HttpClient) { }

    public getStripeCustomer(id: string): Observable<any> {
        return this.http.get(`/api/stripe/customer/${id}`)
    }
}
