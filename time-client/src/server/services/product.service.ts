import { injectable, inject } from 'inversify';
import { Response } from 'express';
import { Error } from 'mongoose';
import { TYPES } from '@dannymayer/time-common/constants/inversify';
import { IProduct } from '@dannymayer/time-common/models/interfaces';
import { Product } from '@dannymayer/time-common/models/db-models';
import { CONSTANTS } from '@dannymayer/time-common/constants';
import { DbClient, ProductSearch, ProductSearchUtils, MongoQueries } from '@dannymayer/time-common/api-utils';

@injectable()
export class ProductService {

    constructor(
        @inject(TYPES.DbClient) private dbClient: DbClient<IProduct>,
        @inject(TYPES.ProductSearchUtils) private productSearchUtils: ProductSearchUtils,
    ) {}

    public getOne(id: string): Promise<IProduct> {
        return new Promise<IProduct>((resolve, reject) => {
            Product.findById(id, (error: Error, product): void => {
                if (error) reject(error);
                else resolve(product);
            });
        });
    }

    /**
     * Get an unfiltered list of parent & standalone products,
     * or use a search/filter query
     *
     * @param {SearchBody} body - The search options
     * @param {express.Response} res - (optional) The express Response - pass this in if you want the documents fetched as a stream and piped into the response
     */
    public search(body: ProductSearch.Body, res?: Response): Promise<IProduct[]> {
        const searchRegExp = new RegExp(body.search, 'gi');
        let searchQueries: any = [];
        let allQuery: any;
        let searchQuery: MongoQueries.And;

        /**
         * If it's a search or filter, create a basic `$and` query for parent and standalone products
         * Else, display parent and standalone products unfiltered;
         */
        if (body.search || body.filters) {
            if (body.search) {
                searchQueries = [
                    { name: { $regex: searchRegExp } },
                    { description: { $regex: searchRegExp } },
                ];
            }
            if (body.filters && body.filters.length) {
                searchQuery = {
                    $and: [
                        { isVariation: { $ne: true } },
                        ...searchQueries,
                    ],
                };
            }
        }
        else {
            allQuery = { isVariation: { $ne: true } };
        }
        
        /**
         * Convert each filter to MongoDB query syntax and add it to `searchQuery.$and`
         */
        body.filters.forEach(filter => {
            
            const isPropertyFilter: boolean = filter.type === 'property' ? true : false;
            const isAttrFilter: boolean = filter.type === 'attribute' ? true : false;
            const isTaxFilter: boolean = filter.type === 'taxonomy' ? true : false;

            // TODO: Query product variations too!

            /*
             * Property Filter
             * 
             */
            if (isPropertyFilter) {
                searchQuery = this.productSearchUtils.propertyFilter(filter, searchQuery);
            }

            /*
             * Attribute Key/Value Filter - performs an `$elemMatch` on `Product.attributeValues`
             */
            if (isAttrFilter && filter.key) {
                searchQuery = this.productSearchUtils.attributeKeyValueFilter(filter, searchQuery);
            }

            /*
             * Attribute Value Filter - performs an `$elemMatch` on `Product.attributeValues`
             */
            if (isAttrFilter && !filter.key) {
                searchQuery = this.productSearchUtils.attributeValueFilter(filter, searchQuery);
            }

            /*
             * Taxonomy Filter - performs an `$elemMatch` on `Product.taxonomies`
             */
            if (isTaxFilter) {
                searchQuery = this.productSearchUtils.taxonomyFilter(filter, searchQuery);
            }
        });

        return this.get(allQuery || searchQuery, body.page, res);
    }

    /**
     * Retrieve a list of products
     * 
     * @param {object} query - The database query
     * @param {number} page - (optional) The page number, which determines how many documents to skip
     * @param {express.Response} res - (optional) The express Response - pass this in if you want the documents fetched as a stream and piped into the response
     */
    public get(query: Object, page: number = 1, res?: Response): Promise<IProduct[]> {
        const skip = (page - 1) * CONSTANTS.PAGINATION.productsPerPage;
        const limit = CONSTANTS.PAGINATION.productsPerPage;

        return new Promise<IProduct[]>((resolve, reject) => {

            /**
             * Stream the products
             */
            if (res) {
                this.dbClient.getFilteredCollection(Product, query, {limit, skip}, res)
                    .catch(err => reject(err));
                resolve();
            }
            
            /**
             * Retrieve the products normally, loading them into memory
             */
            else {
                this.dbClient.getFilteredCollection(Product, query, {limit, skip})
                    .then(products => resolve(products))
                    .catch(err => reject(err));
            }
        });
    }

    public createOne(product: IProduct): Promise<IProduct> {
        return new Promise<IProduct>((resolve, reject) => {
            new Product(product).save((error: Error, newProduct): void => {
                if (error) reject(error);
                else resolve(newProduct);
            });
        });
    }

    public create(products: IProduct[]): Promise<IProduct[]> {
        return new Promise<IProduct[]>((resolve, reject) => {
            Product.create(products, (error: Error, newProducts): void => {
                if (error) reject(error);
                else resolve(newProducts);
            });
        });
    }

    public updateProductWithoutValidation(id: string, update: any): Promise<IProduct> {
        const mongoUpdate = this.dbClient.mongoSet(update);
        return new Promise<IProduct>((resolve, reject) => {
            Product.findByIdAndUpdate(id, mongoUpdate, { new: true }, (error: Error, updatedProduct) => {
                if (error) reject(error);
                else resolve(updatedProduct);
            });
        });
    }

    public updateProduct(id: string, update: any): Promise<IProduct> {
        return new Promise<IProduct>((resolve, reject) => {
            this.dbClient.updateById(Product, id, update)
                .then(updatedProduct => resolve(updatedProduct))
                .catch(validationError => reject(validationError));
        });
    }

    public updateTestProduct(update: any): Promise<IProduct> {
        return this.updateProduct("5988d5f44b224b068cda7d61", update);
    }

    public deleteOne(id: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            Product.findByIdAndRemove(id, (error: Error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }

    public createTest(): Promise<IProduct> {
        return new Promise<IProduct>((resolve, reject) => {
            const theProduct = new Product({
                name: "Test product",
                slub: "test-product",
                SKU: "TEST_1",
            });
            theProduct.save((error: Error, product) => {
                if (error) reject(error);
                else resolve(product);
            });
        });
    }
}
