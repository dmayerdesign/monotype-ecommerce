import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'

import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { SimpleError } from '@mte/common/lib/ng-modules/http'
import { RestService } from '@mte/common/lib/ng-modules/http/http.models'
import { Attribute } from '@mte/common/models/api-models/attribute'
import { AttributeValue } from '@mte/common/models/api-models/attribute-value'
import { Price } from '@mte/common/models/api-models/price'
import { Product } from '@mte/common/models/api-models/product'
import { GetProductsFromIdsRequest, GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { GetAttributeSelectOptionsResponseBody } from '@mte/common/models/api-responses/get-attribute-select-options/get-attribute-select-options.response.body'
import { GetProductDetailResponseBody } from '@mte/common/models/api-responses/get-product-detail/get-product-detail.response.body'
import { Subject } from 'rxjs/Subject'

@Injectable()
export class ProductService extends RestService<Product> {
    public endpoint = ApiEndpoints.Products
    public getSomeRequestType = GetProductsFromIdsRequest

    private getDetailPump = new Subject<GetProductDetailResponseBody>()
    private getDetailErrorPump = new Subject<SimpleError>()
    public getDetails: Observable<GetProductDetailResponseBody>
    public getDetailErrors: Observable<SimpleError>

    private getAttributeSelectOptionsPump = new Subject<GetAttributeSelectOptionsResponseBody>()
    private getAttributeSelectOptionsErrorPump = new Subject<SimpleError>()
    public getAttributeSelectOptionss: Observable<GetAttributeSelectOptionsResponseBody>
    public getAttributeSelectOptionsErrors: Observable<SimpleError>

    constructor (
        protected http: HttpClient,
    ) {
        super(http)
        this.getDetails = this.getDetailPump.asObservable()
        this.getDetailErrors = this.getDetailErrorPump.asObservable()
        this.getAttributeSelectOptionss = this.getAttributeSelectOptionsPump.asObservable()
        this.getAttributeSelectOptionsErrors = this.getAttributeSelectOptionsErrorPump.asObservable()
    }

    public get(request = new GetProductsRequest()): void {
        return super.get(request)
    }

    public getDetail(slug: string): void {
        this.http.get<GetProductDetailResponseBody>(`${this.endpoint}/${slug}/detail`)
            .subscribe(
                (responseBody) => this.getDetailPump.next(responseBody),
                (error: SimpleError) => this.getDetailErrorPump.next(error),
            )
    }

    public getAttributeSelectOptions(slug: string): void {
        this.http.get<GetAttributeSelectOptionsResponseBody>(`${this.endpoint}/${slug}/detail/attribute-selection`)
            .subscribe(
                (responseBody) => this.getAttributeSelectOptionsPump.next(responseBody),
                (error: SimpleError) => this.getAttributeSelectOptionsErrorPump.next(error),
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
