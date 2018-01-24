import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'

import { ApiEndpoints } from '@time/common/constants/api-endpoints'
import { Price } from '@time/common/models/api-models/price'
import { Product } from '@time/common/models/api-models/product'
import { GetProductsFromIdsRequest, GetProductsRequest } from '@time/common/models/api-requests/get-products.request'
import { GetProductDetailResponseBody } from '@time/common/models/api-responses/product-detail/get-product-detail.response.body'
import { SimpleError } from '@time/common/ng-modules/http'
import { RestService } from '@time/common/ng-modules/http/http.models'
import { Subject } from 'rxjs/Subject'

@Injectable()
export class ProductService extends RestService<Product> {
    public endpoint = ApiEndpoints.Products
    public getSomeRequestType = GetProductsFromIdsRequest

    public getDetail$: Observable<GetProductDetailResponseBody>
    public getDetailError$: Observable<SimpleError>
    private getDetailSubject = new Subject<GetProductDetailResponseBody>()
    private getDetailErrorSubject = new Subject<SimpleError>()

    constructor (
        protected http: HttpClient,
    ) {
        super(http)
        this.getDetail$ = this.getDetailSubject.asObservable()
        this.getDetailError$ = this.getDetailErrorSubject.asObservable()
    }

    public get(request = new GetProductsRequest()): void {
        return super.get(request)
    }

    public getDetail(slug: string): void {
        this.http.get<GetProductDetailResponseBody>(`${this.endpoint}/${slug}/detail`)
            .subscribe(
                (responseBody) => this.getDetailSubject.next(responseBody),
                (error: SimpleError) => this.getDetailErrorSubject.next(error),
            )
    }

    public getPrice(product: Product): Price {
        if (product.isOnSale) {
            return product.salePrice
        }
        else {
            return product.price
        }
    }
}
