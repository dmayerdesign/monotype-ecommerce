import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { RestService, SimpleError } from '@mte/common/lib/ng-modules/http'
import { Attribute } from '@mte/common/models/api-interfaces/attribute'
import { AttributeValue } from '@mte/common/models/api-interfaces/attribute-value'
import { Price } from '@mte/common/models/api-interfaces/price'
import { Product } from '@mte/common/models/api-interfaces/product'
import { SimpleAttributeValue } from '@mte/common/models/api-interfaces/simple-attribute-value'
import { GetProductsFromIdsRequest, GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { GetProductDetailResponseBody } from '@mte/common/models/api-responses/get-product-detail/get-product-detail.response.body'
import { Observable, Subject } from 'rxjs'

@Injectable({ providedIn: 'root' })
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

    public getDetail(slug: string): void {
        const getDetail = async () => {
            try {
                const getDetailResponseBody = await this.getDetailOnce(slug)
                this.getDetailPump.next(getDetailResponseBody)
            }
            catch (getDetailError) {
                this.getDetailErrorPump.next(getDetailError)
            }
        }
        getDetail()
    }

    public getVariationsFromAttributeValues(productDetail: Product, variableAttributeValues: (AttributeValue | SimpleAttributeValue)[]): Product[] {
        return productDetail.variations.filter((product: Product) => {
            const allVariationAttributeValues = [
                ...product.simpleAttributeValues as SimpleAttributeValue[],
                ...product.attributeValues as AttributeValue[],
            ]
            const condition = variableAttributeValues.filter((x) => !!x)
                .every((variableAttributeValue) => !!allVariationAttributeValues.find((variationAttributeValue) => variableAttributeValue._id === variationAttributeValue._id))
            return condition
        }) as Product[]
    }
}
