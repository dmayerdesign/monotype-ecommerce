import { Response } from 'express'
import { inject, injectable } from 'inversify'
import { Error } from 'mongoose'

import { DbClient, MongoQueries, ProductSearch, ProductSearchUtils } from '@time/common/api-utils'
import { CONSTANTS } from '@time/common/constants'
import { TYPES } from '@time/common/constants/inversify'
import { Product } from '@time/common/models/api-models'
import { ServiceErrorResponse, ServiceResponse } from '@time/common/models/helpers'
import { IFetchService } from '@time/common/models/interfaces'
import { IProduct } from '@time/common/models/interfaces'

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
        @inject(TYPES.DbClient) private dbClient: DbClient<IProduct>,
        @inject(TYPES.ProductSearchUtils) private productSearchUtils: ProductSearchUtils,
    ) {}

    /**
     * Get a single product
     *
     * @param {string} id The `_id` of the product to be retrieved
     * @return {Promise<IProduct>}
     */
    public getOne(id: string): Promise<ServiceResponse<IProduct>> {
        return new Promise<ServiceResponse<IProduct>>((resolve, reject) => {
            Product.findById(id, (error: Error, product): void => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ServiceResponse(product))
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
    public search(body: ProductSearch.Body, res?: Response): Promise<ServiceResponse<IProduct[]>> {
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

        return this.get(allQuery || searchQuery, body.page, res)
    }

    /**
     * Retrieve a list of products
     *
     * @param {object} query The database query
     * @param {number} [page] The page number, which determines how many documents to skip
     * @param {express.Response} [res] The express Response; pass this in if you want the documents fetched as a stream and piped into the response
     */
    public get(query: object, page: number = 1, res?: Response): Promise<ServiceResponse<IProduct[]>> {
        const skip = (page - 1) * CONSTANTS.PAGINATION.productsPerPage
        const limit = CONSTANTS.PAGINATION.productsPerPage

        return new Promise<ServiceResponse<IProduct[]>>((resolve, reject) => {

            // Stream the products

            if (res) {
                resolve()
                this.dbClient.getFilteredCollection(Product, query, {limit, skip}, res)
                    .catch(err => reject(new ServiceErrorResponse(err)))
            }

            // Retrieve the products normally, loading them into memory

            else {
                this.dbClient.getFilteredCollection(Product, query, {limit, skip})
                    .then(products => resolve(new ServiceResponse(products)))
                    .catch(err => reject(new ServiceErrorResponse(err)))
            }
        })
    }

    public createOne(product: IProduct): Promise<ServiceResponse<IProduct>> {
        return new Promise<ServiceResponse<IProduct>>((resolve, reject) => {
            new Product(product).save((error: Error, newProduct): void => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ServiceResponse(newProduct))
            })
        })
    }

    public create(products: IProduct[]): Promise<ServiceResponse<IProduct[]>> {
        return new Promise<ServiceResponse<IProduct[]>>((resolve, reject) => {
            Product.create(products, (error: Error, newProducts): void => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ServiceResponse(newProducts))
            })
        })
    }

    public updateProductWithoutValidation(id: string, update: any): Promise<ServiceResponse<IProduct>> {
        const mongoUpdate = this.dbClient.mongoSet(update)
        return new Promise<ServiceResponse<IProduct>>((resolve, reject) => {
            Product.findByIdAndUpdate(id, mongoUpdate, { new: true }, (error: Error, updatedProduct) => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ServiceResponse(updatedProduct))
            })
        })
    }

    public updateProduct(id: string, update: any): Promise<ServiceResponse<IProduct>> {
        return new Promise<ServiceResponse<IProduct>>((resolve, reject) => {
            this.dbClient.updateById(Product, id, update)
                .then(updatedProduct => resolve(new ServiceResponse(updatedProduct)))
                .catch(validationError => reject(new ServiceErrorResponse(validationError)))
        })
    }

    public updateTestProduct(update: any): Promise<ServiceResponse<IProduct>> {
        return this.updateProduct("5988d5f44b224b068cda7d61", update)
    }

    public deleteOne(id: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            Product.findByIdAndRemove(id, (error: Error) => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve()
            })
        })
    }

    public createTest(): Promise<ServiceResponse<IProduct>> {
        return new Promise<ServiceResponse<IProduct>>((resolve, reject) => {
            const theProduct = new Product({
                name: "Test product",
                slub: "test-product",
                SKU: "TEST_1",
            })
            theProduct.save((error: Error, product) => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ServiceResponse(product))
            })
        })
    }
}
