import { injectable, inject } from 'inversify';
import { Response } from 'express';
import { Error } from 'mongoose';
import { TYPES } from '@time/constants/inversify';
import { IProduct } from '@time/interfaces';
import { Product } from '@time/models';
import { CONSTANTS } from '@time/constants';
import { DbClient } from '@time/api-utils';

@injectable()
export class ProductService {

    constructor(
        @inject(TYPES.DbClient) private dbClient: DbClient<IProduct>,
    ) {}

    public getOne(id: string): Promise<IProduct> {
        return new Promise<IProduct>((resolve, reject) => {
            Product.findById(id, (error: Error, product): void => {
                if (error) reject(error);
                else resolve(product);
            });
        });
    }

    public get(query: any, page: number = 1, res?: Response): Promise<IProduct[]> {
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
