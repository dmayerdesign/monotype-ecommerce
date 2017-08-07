import { inject, injectable } from 'inversify';
import { BasicCrudService } from '@time/api-services';
import { IProduct } from '@time/interfaces';
import { Product } from '@time/models';
import { CONSTANTS } from '@time/constants';

@injectable()
export class ProductService {

    public test(): Promise<any> {
        return new Promise<any>((resolve) => {
            resolve({ test: "success" });
        });
    }

    public getOne(id: string): Promise<IProduct> {
        return new Promise<IProduct>((resolve, reject) => {
            Product.findById(id, (error, data: IProduct): void => {
                if (error) reject(error);
                else resolve(data);
            });
        });
    }

    public get(query: any, page?: number): Promise<IProduct[]> {
        return new Promise<IProduct[]>((resolve, reject) => {
            Product.find(query, (error, data: IProduct[]): void => {
                if (error) reject(error);
                else resolve(data);
            })
            .skip((page - 1) * CONSTANTS.productsPerPage)
            .limit(CONSTANTS.productsPerPage);
        });
    }

    public createOne(product: IProduct): Promise<IProduct> {
        return new Promise<IProduct>((resolve, reject) => {
            const theProduct = new Product(product);
            theProduct.save((error, data: IProduct): void => {
                if (error) reject(error);
                else resolve(data);
            });
        });
    }

    public create(products: IProduct[]): Promise<IProduct[]> {
        return new Promise<IProduct[]>((resolve, reject) => {
            Product.create(products, (error, data: IProduct[]): void => {
                if (error) reject(error);
                else resolve(data);
            });
        });
    }

    public updateProduct(id: string, product: IProduct): Promise<IProduct> {
        return new Promise<IProduct>((resolve, reject) => {
            Product.findByIdAndUpdate(id, product, { new: true }, (error, data) => {
                if (error) reject(error);
                else resolve(data);
            });
        });
    }

    public deleteOne(id: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            Product.findByIdAndRemove(id, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
}
