import { inject, injectable } from 'inversify';
import { IProduct } from '../../../../time-common/models/interfaces';
import { Product } from '../../../../time-common/models/db-models';

@injectable()
export class ProductService {

    public getOne(id: string): Promise<IProduct> {
        return new Promise<IProduct>((resolve, reject) => {
            Product.findById(id, (error, data: IProduct): void => {
                if (error) reject(error);
                else resolve(data);
            });
        });
    }

    public get(query: any): Promise<IProduct[]> {
        return new Promise<IProduct[]>((resolve, reject) => {
            Product.find(query, (error, data: IProduct[]): void => {
                if (error) reject(error);
                else resolve(data);
            });
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
