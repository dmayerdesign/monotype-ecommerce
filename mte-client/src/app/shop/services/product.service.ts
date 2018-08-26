import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AttributeValue } from '@mte/common/api/interfaces/attribute-value'
import { Product } from '@mte/common/api/interfaces/product'
import { SimpleAttributeValue } from '@mte/common/api/interfaces/simple-attribute-value'
import { GetProductsFromIdsRequest, GetProductsRequest } from '@mte/common/api/requests/get-products.request'
import { GetProductDetailResponseBody } from '@mte/common/api/responses/get-product-detail/get-product-detail.response.body'
import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { RestService, SimpleError } from '@mte/common/lib/ng-modules/http'
import { Observable, Subject } from 'rxjs'

@Injectable()
export class ProductService extends RestService<Product> {
    public endpoint = ApiEndpoints.Products
    public getSomeRequestType = GetProductsFromIdsRequest

    private getDetailPump = new Subject<GetProductDetailResponseBody>()
    private getDetailErrorPump = new Subject<SimpleError>()
    public getDetails: Observable<GetProductDetailResponseBody>
    public getDetailErrors: Observable<SimpleError>

    constructor (
        protected httpClient: HttpClient,
    ) {
        super(httpClient)
        this.getDetails = this.getDetailPump.asObservable()
        this.getDetailErrors = this.getDetailErrorPump.asObservable()
    }

    public get(request = new GetProductsRequest()): Promise<void> {
        return super.get(request)
    }

    public async getDetail(slug: string): Promise<void> {
        try {
            const getDetailResponseBody = await this.getDetailOnce(slug)
            this.getDetailPump.next(getDetailResponseBody)
        }
        catch (getDetailError) {
            this.getDetailErrorPump.next(getDetailError)
        }
    }

    public getDetailOnce(slug: string): Promise<GetProductDetailResponseBody> {
        return this.httpClient.get<GetProductDetailResponseBody>(`${this.endpoint}/${slug}/detail`).toPromise()
    }

    public getVariationsFromAttributeValues(
        productDetail: Product,
        variableAttributeValues: (AttributeValue | SimpleAttributeValue)[]
    ): Product[] {
        return productDetail.variations.filter((product: Product) => {
            const allVariationAttributeValues = [
                ...product.simpleAttributeValues as SimpleAttributeValue[],
                ...product.attributeValues as AttributeValue[],
            ]

            // Only return variations wherein every attribute value passed into this method
            // finds a match within the variation's attribute values.

            return variableAttributeValues
                .filter((x) => !!x) // TODO: Make sure that `variableAttributeValues` never has falsy elements.
                .every((variableAttributeValue) =>
                    !!allVariationAttributeValues.find((variationAttributeValue) =>
                        variableAttributeValue._id === variationAttributeValue._id))
        }) as Product[]
    }
}
