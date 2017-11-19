import { Response } from 'express'
import { inject, injectable } from 'inversify'
import { InstanceType } from 'typegoose'

import { Crud, CurrencyEnum, HttpStatus } from '@time/common/constants'
import { Types } from '@time/common/constants/inversify'
import { Price } from '@time/common/models/api-models/price'
import { Product, ProductModel } from '@time/common/models/api-models/product'
import { GetProductsRequest } from '@time/common/models/api-requests/get-products.request'
import { ApiErrorResponse, ApiResponse } from '@time/common/models/helpers'
import { IFetchService } from '@time/common/models/interfaces'
import { DbClient, MongoQueries, ProductSearchUtils } from '../utils'

/**
 * Service for fetching documents from the `products` collection
 */
@injectable()
export class ProductService implements IFetchService<Product> {

    /**
     * Instantiate the service
     *
     * @param {DbClient<Product>} dbClient A service containing helper methods for database operations
     * @param {ProductSearchUtils} productSearchUtils A service containing helper methods for product search
     */
    constructor(
        @inject(Types.DbClient) private dbClient: DbClient<Product>,
        @inject(Types.ProductSearchUtils) private productSearchUtils: ProductSearchUtils,
    ) {}

    /**
     * Get a single product
     *
     * @param {string} slug The `slug` of the product to be retrieved
     * @return {Promise<Product>}
     */
    public getOne(slug: string): Promise<ApiResponse<Product>> {
        return new Promise<ApiResponse<Product>>(async (resolve, reject) => {
            try {
                const product = await ProductModel.findOne({ slug })
                resolve(new ApiResponse(product))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    /**
     * Get a single product by ID
     *
     * @param {string} id The `_id` of the product to be retrieved
     * @return {Promise<Product>}
     */
    public getById(id: string) {
        return new Promise<ApiResponse<Product>>(async (resolve, reject) => {
            try {
                const product = await ProductModel.findById(id)
                resolve(new ApiResponse(product))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    /**
     * Get a list of products with an array of `_id`s
     *
     * @param {string} id The `_id` of the product to be retrieved
     * @return {Promise<Product>}
     */
    public getSome(ids: string[]) {
        return new Promise<ApiResponse<Product[]>>(async (resolve, reject) => {
            try {
                const products = await ProductModel.find({ _id: { $in: ids } })
                resolve(new ApiResponse(products))
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
    public get(body: GetProductsRequest, res?: Response): Promise<ApiResponse<Product[]>>|void {
        const searchRegExp = body.search ? new RegExp(body.search, 'gi') : undefined
        const limit = body.page ? Crud.Pagination.productsPerPage : 0
        const page = body.page
        const skip = (page > 0) ? ((page - 1) * limit) : 0
        let searchNameAndDesc: {
            [key: string]: { $regex: RegExp }
        }[] = []
        let allQuery: any
        let searchQuery: MongoQueries.And
        let query: any

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

        if (searchRegExp) {
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

        query = allQuery || searchQuery

        if (res) {
            this.dbClient.getFilteredCollection(ProductModel, query, {limit, skip}, res)
                .catch(err => new ApiErrorResponse(err))
        }
        else {
            return new Promise<ApiResponse<Product[]>>(async (resolve, reject) => {
                // Retrieve the products normally, loading them into memory
                try {
                    const products = await this.dbClient.getFilteredCollection(ProductModel, query, {limit, skip})
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
                const newProduct = await new ProductModel(product).save()
                resolve(new ApiResponse(newProduct))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public create(products: Product[]): Promise<ApiResponse<Product[]>> {
        return new Promise<ApiResponse<Product[]>>(async (resolve, reject) => {
            try {
                const newProducts = await ProductModel.create(products)
                resolve(new ApiResponse(newProducts))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public updateProductWithoutValidation(id: string, update: any): Promise<ApiResponse<Product>> {
        const mongoUpdate = this.dbClient.mongoSet(update)
        return new Promise<ApiResponse<Product>>(async (resolve, reject) => {
            try {
                const updatedProduct = await ProductModel.findByIdAndUpdate(id, mongoUpdate, { new: true })
                resolve(new ApiResponse(updatedProduct))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public updateProduct(id: string, update: any): Promise<ApiResponse<Product>> {
        return new Promise<ApiResponse<Product>>(async (resolve, reject) => {
            try {
                const updatedProduct = await this.dbClient.updateById(ProductModel, id, update)
                resolve(new ApiResponse(updatedProduct))
            }
            catch (validationError) {
                reject(new ApiErrorResponse(validationError))
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
        return this.updateProduct("5988d5f44b224b068cda7d61", update)
    }

    public createTest(): Promise<ApiResponse<Product>> {
        return new Promise<ApiResponse<Product>>(async (resolve, reject) => {
            const theProduct = new ProductModel({
                name: "Test product",
                slug: "test-product",
                SKU: "TEST_1",
            })
            try {
                const product = await theProduct.save()
                resolve(new ApiResponse(product))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public determinePrice(product: InstanceType<Product>) {
        if (product.isOnSale && product.salePrice) {
            return product.salePrice
        }
        else if (product.price) {
            return product.price
        }
        return {
            total: 0,
            currency: CurrencyEnum.USD,
        }
    }
}
