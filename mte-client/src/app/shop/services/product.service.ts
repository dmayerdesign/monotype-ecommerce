import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'

import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { RestService, SimpleError } from '@mte/common/lib/ng-modules/http'
import { Attribute } from '@mte/common/models/api-models/attribute'
import { AttributeValue } from '@mte/common/models/api-models/attribute-value'
import { Price } from '@mte/common/models/api-models/price'
import { Product } from '@mte/common/models/api-models/product'
import { GetProductsFromIdsRequest, GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
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

    constructor (
        protected http: HttpClient,
    ) {
        super(http)
        this.getDetails = this.getDetailPump.asObservable()
        this.getDetailErrors = this.getDetailErrorPump.asObservable()
    }

    public get(request = new GetProductsRequest()): void {
        return super.get(request)
    }

    public getDetailOnce(slug: string): Promise<GetProductDetailResponseBody> {
        return this.http.get<GetProductDetailResponseBody>(`${this.endpoint}/${slug}/detail`).toPromise()
    }

    public async getDetail(slug: string): Promise<any> {
        try {
            const getDetailResponseBody = await this.getDetailOnce(slug)
            this.getDetailPump.next(getDetailResponseBody)
        }
        catch (getDetailError) {
            this.getDetailErrorPump.next(getDetailError)
        }
    }

    public getPrice(product: Product): Price {
        if (product.isOnSale) {
            return product.salePrice
        }
        else {
            return product.price
        }
    }

    public getName(product: Product): string {
        if (product.isParent || product.isStandalone || !product.parent || !(product.parent as Product)._id) {
            return product.name
        } else {
            return (product.parent as Product).name
        }
    }
}
