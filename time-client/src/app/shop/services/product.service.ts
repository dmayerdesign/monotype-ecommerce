import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'

import { ApiEndpoints } from '@time/common/constants/api-endpoints'
import { Price } from '@time/common/models/api-models/price'
import { Product } from '@time/common/models/api-models/product'
import { GetProductsFromIdsRequest, GetProductsRequest } from '@time/common/models/api-requests/get-products.request'
import { SimpleError } from '@time/common/ng-modules/http'
import { RestService } from '@time/common/ng-modules/http/http.models'

@Injectable()
export class ProductService extends RestService<Product> {
    constructor (
        private http: HttpClient,
    ) {
        super()
    }

    public get(request?: GetProductsRequest) {
        const params = new HttpParams()

        if (request) params.append('request', JSON.stringify(request))

        // this.http.get("https://jsonplaceholder.typicode.com/posts")
        this.http.get<Product[]>(ApiEndpoints.Products, { params })
            .subscribe(
                (products) => this.getSubject.next(products),
                (error: SimpleError) => this.getErrorSubject.next(error),
            )
    }

    public getSome(ids: string[]): Observable<Product[]> {
        const request = new GetProductsFromIdsRequest()
        request.ids = ids

        const params = new HttpParams()
        params.append('request', JSON.stringify(request))

        return this.http.get<Product[]>(ApiEndpoints.Products, { params })
    }

    public displayOne(slug: string) {
        this.getOneSubject.next(this.data.find(product => product.slug === slug))
    }

    public getOne(slug: string) {
        this.http.get<Product>(`${ApiEndpoints.Products}/${slug}`)
            .subscribe(
                (product) => this.getOneSubject.next(product),
                (error: SimpleError) => this.getOneErrorSubject.next(error),
            )
    }

    public getPrice(product: Product) {
        if (product.isOnSale) {
            return product.salePrice
        }
        else {
            return product.price
        }
    }
}
