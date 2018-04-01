import { Response } from 'express'
import { inject, injectable } from 'inversify'
import * as mongoose from 'mongoose'

import { Crud, HttpStatus } from '@mte/common/constants'
import { Types } from '@mte/common/constants/inversify'
import { MongooseModel } from '@mte/common/lib/goosetype'
import { AttributeModel } from '@mte/common/models/api-models/attribute'
import { AttributeValueModel } from '@mte/common/models/api-models/attribute-value'
import { Organization } from '@mte/common/models/api-models/organization'
import { Product, ProductModel } from '@mte/common/models/api-models/product'
import { TaxonomyTerm } from '@mte/common/models/api-models/taxonomy-term'
import { TaxonomyTermModel } from '@mte/common/models/api-models/taxonomy-term'
import { GetProductsFilterType, GetProductsFromIdsRequest, GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { ListFromQueryRequest } from '@mte/common/models/api-requests/list.request'
import { ApiErrorResponse } from '@mte/common/models/api-responses/api-error.response'
import { ApiResponse } from '@mte/common/models/api-responses/api.response'
import { GetProductDetailResponseBody } from '@mte/common/models/api-responses/product-detail/get-product-detail.response.body'
import { Currency } from '@mte/common/models/enums/currency'
import { Price } from '@mte/common/models/interfaces/api/price'
import { DbClient } from '../data-access/db-client'
import { ProductSearchHelper } from '../helpers/product-search.helper'
import { CrudService } from './crud.service'
import { OrganizationService } from './organization.service'

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
        @inject(Types.OrganizationService) private organizationService: OrganizationService
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
                        path: 'taxonomyTerms',
                        model: TaxonomyTermModel,
                    },
                    {
                        path: 'variableAttributes',
                        model: AttributeModel,
                    },
                    {
                        path: 'variableAttributeValues',
                        model: AttributeValueModel,
                    },
                    {
                        path: 'variations',
                        populate: {
                            path: 'attributeValues',
                            model: AttributeValueModel,
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
        return new Promise<ApiResponse<Product[]>>(async (resolve, reject) => {
            const {
                limit,
                skip,
                search,
                filters,
                sortBy,
                sortDirection,
            } = new GetProductsRequest(body)
            let taxonomyTermIdsToSearch: string[]
            const searchRegExp = search ? new RegExp(search, 'gi') : undefined
            const searchOr: {
                $or: {
                    [key: string]: { $regex: RegExp } | { $in: string[] }
                }[]
            } = { $or: [] }
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

            // If there's a search:
            if (searchRegExp) {
                // Find taxonomy terms from the taxonomies defined by the organization as searchable.
                let organization: Organization

                try {
                    organization = (await this.organizationService.getOrganization()).body
                    const searchableTaxonomiesQuery = {
                        taxonomy: { $in: organization.searchableTaxonomies },
                        name: { $regex: searchRegExp },
                        slug: { $regex: searchRegExp },
                    }
                    taxonomyTermIdsToSearch = (await this.dbClient.findQuery<TaxonomyTerm>(TaxonomyTermModel, new ListFromQueryRequest({ query: searchableTaxonomiesQuery })))
                        .map((taxonomyTerm) => taxonomyTerm._id)
                }
                catch (error) {
                    reject(error)
                }

                // Add the regex queries for name, description, and taxonomy.
                searchOr.$or.push({ name: { $regex: searchRegExp } })
                searchOr.$or.push({ description: { $regex: searchRegExp } })
                searchOr.$or.push({ taxonomyTerms: { $in: taxonomyTermIdsToSearch } })

                searchQuery.$and.push(searchOr)
            }

            // If there are filters, convert each filter to MongoDB query syntax and add it to `searchQuery.$and`.

            if (filters) {
                for (let i = 0; i < filters.length; i++) {
                    const filter = filters[i]

                    if (!filter.values || !filter.values.length) {
                        continue
                    }

                    const isPropertyFilter: boolean = filter.type === GetProductsFilterType.Property ? true : false
                    const isAttrFilter: boolean = filter.type === GetProductsFilterType.Attribute ? true : false
                    const isTaxFilter: boolean = filter.type === GetProductsFilterType.Taxonomy ? true : false

                    // Property Filter.

                    if (isPropertyFilter) {
                        searchQuery = this.productSearchHelper.propertyFilter(filter, searchQuery)
                    }

                    // Attribute Key/Value Filter - performs an `$elemMatch` on `Product.attributeValues`.

                    if (isAttrFilter && filter.key) {
                        searchQuery = this.productSearchHelper.attributeKeyValueFilter(filter, searchQuery)
                    }

                    // Attribute Value Filter - performs an `$or` query on `Product.attributeValues`.

                    if (isAttrFilter && !filter.key) {
                        searchQuery = this.productSearchHelper.attributeValueFilter(filter, searchQuery)
                    }

                    // Taxonomy Filter - performs an `$or` query on `Product.taxonomyTerms`.

                    if (isTaxFilter) {
                        const taxonomyTerms = await this.dbClient.findQuery<TaxonomyTerm>(TaxonomyTermModel, { query: { slug: { $in: filter.values } } })
                        const taxonomyTermIds = taxonomyTerms ? taxonomyTerms.map((term) => term._id) : []
                        searchQuery = this.productSearchHelper.taxonomyTermFilter(taxonomyTermIds, searchQuery)
                    }
                }
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
                // Stream the products.
                this.dbClient.findQuery(ProductModel, listFromQueryRequest, res)
                resolve()
            }
            else {
                // Retrieve the products normally, loading them into memory.
                try {
                    const products = await this.dbClient.findQuery(ProductModel, listFromQueryRequest)
                    resolve(new ApiResponse(products))
                }
                catch (error) {
                    reject(new ApiErrorResponse(error))
                }
            }
        })
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
                const newProducts = await this.dbClient.create(ProductModel, products) as Product[]
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
                await this.dbClient.delete(ProductModel, id)
                resolve(new ApiResponse({}, HttpStatus.SUCCESS_NO_CONTENT))
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

    public determinePrice(product: Product): Price {
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
