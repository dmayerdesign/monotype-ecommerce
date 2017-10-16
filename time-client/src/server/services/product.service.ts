import { Response } from 'express'
import { inject, injectable } from 'inversify'
import { Error } from 'mongoose'

import { DbClient, MongoQueries, ProductSearch, ProductSearchUtils } from '@time/common/api-utils'
import { Crud, HttpStatus } from '@time/common/constants'
import { Types } from '@time/common/constants/inversify'
import { Product } from '@time/common/models/api-models'
import { ApiResponse, ServiceErrorResponse } from '@time/common/models/helpers'
import { IFetchService } from '@time/common/models/interfaces'
import { IPrice, IProduct } from '@time/common/models/interfaces'

/**
 * Service for fetching documents from the `products` collection
 */
@injectable()
export class ProductService implements IFetchService<IProduct> {

    /**
     * Instantiate the service
     *
     * @param {DbClient<IProduct>} dbClient A service containing helper methods for database operations
     * @param {ProductSearchUtils} productSearchUtils A service containing helper methods for product search
     */
    constructor(
        @inject(Types.DbClient) private dbClient: DbClient<IProduct>,
        @inject(Types.ProductSearchUtils) private productSearchUtils: ProductSearchUtils,
    ) {}

    /**
     * Get a single product
     *
     * @param {string} id The `_id` of the product to be retrieved
     * @return {Promise<IProduct>}
     */
    public getOne(id: string): Promise<ApiResponse<IProduct>> {
        return new Promise<ApiResponse<IProduct>>((resolve, reject) => {
            Product.findById(id, (error: Error, product): void => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ApiResponse(product))
            })
        })
    }

    /**
     * Get an unfiltered list of parent & standalone products,
     * or use a search/filter query
     *
     * @param {SearchBody} body The search options
     * @param {express.Response} [res] The express Response; pass this in if you want the documents fetched as a stream and piped into the response
     */
    public search(body: ProductSearch.Body, res?: Response): Promise<ApiResponse<IProduct[]>>|void {
        const searchRegExp = new RegExp(body.search, 'gi')
        let searchNameAndDesc: any = []
        let allQuery: any
        let searchQuery: MongoQueries.And

        // If it's a search or filter, create a basic `$and` query for parent and standalone products

        if (body.search || body.filters) {
            searchQuery = {
                $and: [
                    { isVariation: { $ne: true } },
                ],
            }
        }

        // Else, display parent and standalone products unfiltered

        else {
            allQuery = { isVariation: { $ne: true } }
        }

        // If there's a search, create a regex for name and description

        if (body.search) {
            searchNameAndDesc = [
                { name: { $regex: searchRegExp } },
                { description: { $regex: searchRegExp } },
            ]
            searchQuery.$and = searchQuery.$and.concat(searchNameAndDesc)
        }

        // If there are filters, convert each filter to MongoDB query syntax and add it to `searchQuery.$and`

        if (body.filters) {
            body.filters.forEach(filter => {

                const isPropertyFilter: boolean = filter.type === 'property' ? true : false
                const isAttrFilter: boolean = filter.type === 'attribute' ? true : false
                const isTaxFilter: boolean = filter.type === 'taxonomy' ? true : false

                // Property Filter

                if (isPropertyFilter) {
                    searchQuery = this.productSearchUtils.propertyFilter(filter, searchQuery)
                }

                // Attribute Key/Value Filter - performs an `$elemMatch` on `Product.attributeValues`

                if (isAttrFilter && filter.key) {
                    searchQuery = this.productSearchUtils.attributeKeyValueFilter(filter, searchQuery)
                }

                // Attribute Value Filter - performs an `$elemMatch` on `Product.attributeValues`

                if (isAttrFilter && !filter.key) {
                    searchQuery = this.productSearchUtils.attributeValueFilter(filter, searchQuery)
                }


                // Taxonomy Filter - performs an `$elemMatch` on `Product.taxonomies`

                if (isTaxFilter) {
                    searchQuery = this.productSearchUtils.taxonomyFilter(filter, searchQuery)
                }
            })
        }

        return this.get(allQuery || searchQuery, { page: body.page, limit: body.limit }, res)
    }

    /**
     * Retrieve a list of products
     *
     * @param {object} query The database query
     * @param {object} [queryOptions] An object with `page` and `limit` properties
     * @param {express.Response} [res] The express Response; pass this in if you want the documents fetched as a stream and piped into the response
     */
    public get(query: object, queryOptions = { page: 1, limit: Crud.Pagination.productsPerPage }, res?: Response): Promise<ApiResponse<IProduct[]>>|void {
        const limit = queryOptions.limit
        const page = queryOptions.page
        const skip = (page - 1) * limit

        if (res) {
            this.dbClient.getFilteredCollection(Product, query, {limit, skip}, res)
                .catch(err => new ServiceErrorResponse(err))
        }
        else {
            return new Promise<ApiResponse<IProduct[]>>((resolve, reject) => {
                // Retrieve the products normally, loading them into memory
                this.dbClient.getFilteredCollection(Product, query, {limit, skip})
                    .then(products => resolve(new ApiResponse(products)))
                    .catch(err => reject(new ServiceErrorResponse(err)))
            })
        }
    }

    public createOne(product: IProduct): Promise<ApiResponse<IProduct>> {
        return new Promise<ApiResponse<IProduct>>((resolve, reject) => {
            new Product(product).save((error: Error, newProduct): void => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ApiResponse(newProduct))
            })
        })
    }

    public create(products: IProduct[]): Promise<ApiResponse<IProduct[]>> {
        return new Promise<ApiResponse<IProduct[]>>((resolve, reject) => {
            Product.create(products, (error: Error, newProducts): void => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ApiResponse(newProducts))
            })
        })
    }

    public updateProductWithoutValidation(id: string, update: any): Promise<ApiResponse<IProduct>> {
        const mongoUpdate = this.dbClient.mongoSet(update)
        return new Promise<ApiResponse<IProduct>>((resolve, reject) => {
            Product.findByIdAndUpdate(id, mongoUpdate, { new: true }, (error: Error, updatedProduct) => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ApiResponse(updatedProduct))
            })
        })
    }

    public updateProduct(id: string, update: any): Promise<ApiResponse<IProduct>> {
        return new Promise<ApiResponse<IProduct>>((resolve, reject) => {
            this.dbClient.updateById(Product, id, update)
                .then(updatedProduct => resolve(new ApiResponse(updatedProduct)))
                .catch(validationError => reject(new ServiceErrorResponse(validationError)))
        })
    }

    public getPrice(product: IProduct): IPrice {
        if (product.isOnSale) {
            return product.salePrice
        }
        else {
            return product.price
        }
    }

    public deleteOne(id: string): Promise<ApiResponse<any>> {
        return new Promise<ApiResponse<any>>((resolve, reject) => {
            Product.findByIdAndRemove(id)
            .then(updatedProduct => resolve(new ApiResponse({}, HttpStatus.SUCCESS_noContent)))
            .catch(error => reject(new ServiceErrorResponse(error)))
        })
    }

    public updateTestProduct(update: any): Promise<ApiResponse<IProduct>> {
        return this.updateProduct("5988d5f44b224b068cda7d61", update)
    }

    public createTest(): Promise<ApiResponse<IProduct>> {
        return new Promise<ApiResponse<IProduct>>((resolve, reject) => {
            const theProduct = new Product({
                name: "Test product",
                slub: "test-product",
                SKU: "TEST_1",
            })
            theProduct.save((error: Error, product) => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ApiResponse(product))
            })
        })
    }
}
