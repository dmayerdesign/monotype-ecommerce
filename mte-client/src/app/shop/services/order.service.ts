import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { Order } from '@mte/common/models/api-interfaces/order'
import { Observable } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class OrderService {

    constructor (private http: HttpClient) { }

    public place(order: Order): Observable<Order> {
        return this.http.post<Order>(`${ApiEndpoints.Orders}/place`, order)
    }
}
