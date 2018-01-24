import { Response } from 'express'
import { inject, injectable } from 'inversify'
import * as mongoose from 'mongoose'

import { Crud, HttpStatus } from '@time/common/constants'
import { Types } from '@time/common/constants/inversify'
import { IMongooseModel } from '@time/common/lib/goosetype'
import { Price } from '@time/common/models/api-models/price'
import { Product, ProductModel } from '@time/common/models/api-models/product'
import { GetProductsFromIdsRequest, GetProductsRequest } from '@time/common/models/api-requests/get-products.request'
import { ListFromQueryRequest } from '@time/common/models/api-requests/list.request'
import { ApiErrorResponse } from '@time/common/models/api-responses/api-error.response'
import { ApiResponse } from '@time/common/models/api-responses/api.response'
import { GetProductDetailResponseBody } from '@time/common/models/api-responses/product-detail/get-product-detail.response.body'
import { Currency } from '@time/common/models/enums/currency'
import { IPrice } from '@time/common/models/interfaces/api/price'
import { DbClient } from '../data-access/db-client'
import { ProductSearchHelper } from '../helpers/product-search.helper'
import { CrudService } from './crud.service'

/**
 * Methods for querying the `products` collection
 *
 * @export
 * @class ProductService
 * @extends {CrudService<Product>}
 */
@injectable()
export class ProductService extends CrudService<Product> {

    protected model = ProductModel
    protected listRequestType = GetProductsRequest
    protected listFromIdsRequestType = GetProductsFromIdsRequest

    constructor(
        @inject(Types.DbClient) protected dbClient: DbClient<Product>,
        @inject(Types.ProductSearchHelper) private productSearchHelper: ProductSearchHelper,
    ) {
        super()
    }

    /**
     * Get a single product by slug.
     *
     * @param {string} slug The `slug` of the product to be retrieved
     * @return {Promise<Product>}
     */
    public getOneSlug(slug: string): Promise<ApiResponse<Product>> {
        return new Promise<ApiResponse<Product>>(async (resolve, reject) => {
            try {
                const product = await this.dbClient.findOne(ProductModel, { slug })
                resolve(new ApiResponse(product))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    /**
     * Get a fully populated product by slug.
     *
     * @param {string} slug The `slug` of the product to be retrieved
     * @return {Promise<GetProductDetailResponseBody>}
     */
    public getDetail(slug: string): Promise<ApiResponse<GetProductDetailResponseBody>> {
        return new Promise<ApiResponse<GetProductDetailResponseBody>>(async (resolve, reject) => {
            try {
                const product = await this.dbClient.findOne(ProductModel, { slug }, [
                    {
                        path: 'variableAttributes',
                        model: 'Attribute'
                    },
                    {
                        path: 'variations',
                        populate: {
                            path: 'attributeValues',
                            model: 'AttributeValue'
                        }
                    }
                ])

                resolve(new ApiResponse(product))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    /**
     * Get an unfiltered list of parent & standalone products,
     * or use a search/filter query
     *
     * @param {GetProductsRequest} body The search options
     * @param {express.Response} [res] The express Response; pass this in if you want the documents fetched as a stream and piped into the response
     */
    public getProducts(body: GetProductsRequest, res?: Response): Promise<ApiResponse<Product[]>>|void {
        const {
            limit,
            skip,
            search,
            filters,
            sortBy,
            sortDirection,
        } = new GetProductsRequest(body)
        const searchRegExp = search ? new RegExp(search, 'gi') : undefined
        let searchNameAndDesc: {
            [key: string]: { $regex: RegExp }
        }[] = []
        let allQuery: any
        let searchQuery: { $and: object[] }
        let query: any

        // If it's a search or filter, create a basic `$and` query for parent and standalone products.

        if (search || filters) {
            searchQuery = {
                $and: [
                    { isVariation: { $ne: true } },
                ],
            }
        }

        // Else, display parent and standalone products unfiltered.

        else {
            allQuery = { isVariation: { $ne: true } }
        }

        // If there's a search, create a regex for name and description.

        if (searchRegExp) {
            searchNameAndDesc = [
                { name: { $regex: searchRegExp } },
                { description: { $regex: searchRegExp } },
            ]
            searchQuery.$and = searchQuery.$and.concat(searchNameAndDesc)
        }

        // If there are filters, convert each filter to MongoDB query syntax and add it to `searchQuery.$and`.

        if (filters) {
            filters.forEach((filter) => {

                const isPropertyFilter: boolean = filter.type === 'property' ? true : false
                const isAttrFilter: boolean = filter.type === 'attribute' ? true : false
                const isTaxFilter: boolean = filter.type === 'taxonomy' ? true : false

                // Property Filter.

                if (isPropertyFilter) {
                    searchQuery = this.productSearchHelper.propertyFilter(filter, searchQuery)
                }

                // Attribute Key/Value Filter - performs an `$elemMatch` on `Product.attributeValues`.

                if (isAttrFilter && filter.key) {
                    searchQuery = this.productSearchHelper.attributeKeyValueFilter(filter, searchQuery)
                }

                // Attribute Value Filter - performs an `$elemMatch` on `Product.attributeValues`.

                if (isAttrFilter && !filter.key) {
                    searchQuery = this.productSearchHelper.attributeValueFilter(filter, searchQuery)
                }

                // Taxonomy Filter - performs an `$elemMatch` on `Product.taxonomies`.

                if (isTaxFilter) {
                    searchQuery = this.productSearchHelper.taxonomyFilter(filter, searchQuery)
                }
            })
        }

        query = allQuery || searchQuery

        const listFromQueryRequest = new ListFromQueryRequest({
            limit,
            skip,
            sortBy,
            sortDirection,
            query
        })

        if (res) {
            this.dbClient.findQuery(ProductModel, listFromQueryRequest, res)
        }
        else {
            return new Promise<ApiResponse<Product[]>>(async (resolve, reject) => {
                // Retrieve the products normally, loading them into memory.
                try {
                    const products = await this.dbClient.findQuery(ProductModel, listFromQueryRequest)
                    resolve(new ApiResponse(products))
                }
                catch (error) {
                    reject(new ApiErrorResponse(error))
                }
            })
        }
    }

    public createOne(product: Product): Promise<ApiResponse<Product>> {
        return new Promise<ApiResponse<Product>>(async (resolve, reject) => {
            try {
                const newProduct = await new ProductModel(product).save() as Product
                resolve(new ApiResponse(newProduct._doc))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public create(products: Product[]): Promise<ApiResponse<Product[]>> {
        return new Promise<ApiResponse<Product[]>>(async (resolve, reject) => {
            try {
                const newProducts = await ProductModel.create(products) as Product[]
                resolve(new ApiResponse(newProducts))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public deleteOne(id: string): Promise<ApiResponse<any>> {
        return new Promise<ApiResponse<any>>(async (resolve, reject) => {
            try {
                await ProductModel.findByIdAndRemove(id)
                resolve(new ApiResponse({}, HttpStatus.SUCCESS_noContent))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public updateTestProduct(update: any): Promise<ApiResponse<Product>> {
        return this.updateOne('5988d5f44b224b068cda7d61', update)
    }

    public createTest(): Promise<ApiResponse<Product>> {
        return new Promise<ApiResponse<Product>>(async (resolve, reject) => {
            const theProduct = new ProductModel({
                name: 'Test product',
                slug: 'test-product',
                sku: 'TEST_1',
            })
            try {
                const product = await theProduct.save() as Product
                resolve(new ApiResponse(product._doc))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public getPrice(product: Product): Price {
        if (product.isOnSale) {
            return product.salePrice
        }
        else {
            return product.price
        }
    }

    public determinePrice(product: Product): IPrice {
        if (product.isOnSale && product.salePrice) {
            return product.salePrice
        }
        else if (product.price) {
            return product.price
        }
        return {
            amount: 0,
            currency: Currency.USD,
        }
    }
}
