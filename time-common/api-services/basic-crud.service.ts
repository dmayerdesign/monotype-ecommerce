import { inject, injectable } from 'inversify';
import { Model, Document, Error } from 'mongoose';

@injectable()
export class BasicCrudService<T extends Document> {

    private model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    public get(query: any): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            Model.find(query, (error: Error, data: T[]): void => {
                if (error) reject(error);
                else resolve(data);
            });
        });
    }

    public getOne(id: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            Model.findById(id, (error: Error, data: T): void => {
                if (error) reject(error);
                else resolve(data);
            });
        });
    }

    public createOne(doc: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            new Model(doc).save((error: Error, newDoc: T): void => {
                if (error) reject(error);
                else resolve(newDoc);
            });
        });
    }

    public create(docs: T[]): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            Model.create(docs, (error: Error, newDocs: T[]): void => {
                if (error) reject(error);
                else resolve(newDocs);
            });
        });
    }

    public updateOne(id: string, doc: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            Model.findByIdAndUpdate(id, doc, { new: true }, (error: Error, newDoc: T) => {
                if (error) reject(error);
                else resolve(newDoc);
            });
        });
    }

    public deleteOne(id: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            Model.findByIdAndRemove(id, (error: Error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
}
