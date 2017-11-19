import { injectable } from 'inversify'
import { Document, Error } from 'mongoose'
import { ModelType } from 'typegoose'

import { ErrorMessage } from '@time/common/constants/error-message'
import { HttpStatus } from '@time/common/constants/http'
import { ApiErrorResponse, ApiResponse } from '@time/common/models/helpers'

@injectable()
export class BasicCrudService<T extends Document> {

    private model: ModelType<T>

    constructor(model: ModelType<T>) {
        this.model = model
    }

    public get(query: any) {
        return new Promise<ApiResponse<T[]>>((resolve, reject) => {
            this.model.find(query, (error: Error, data: T[]): void => {
                if (error) {
                    reject(new ApiErrorResponse(error))
                }
                else if (!data || !data.length) {
                    reject(new ApiErrorResponse(new Error(ErrorMessage.DocumentsNotFound), HttpStatus.CLIENT_ERROR_notFound))
                }
                else {
                    resolve(new ApiResponse(data))
                }
            })
        })
    }

    public getOne(id: string) {
        return new Promise<ApiResponse<T>>((resolve, reject) => {
            this.model.findById(id, (error: Error, data: T): void => {
                if (error) {
                    reject(new ApiErrorResponse(error))
                }
                else if (!data) {
                    reject(new ApiErrorResponse(new Error(ErrorMessage.DocumentNotFound), HttpStatus.CLIENT_ERROR_notFound))
                }
                else {
                    resolve(new ApiResponse(data))
                }
            })
        })
    }

    public createOne(doc: T) {
        return new Promise<ApiResponse<T>>((resolve, reject) => {
            new this.model(doc).save((error: Error, newDoc: T): void => {
                if (error) {
                    reject(new ApiErrorResponse(error))
                }
                else if (!newDoc) {
                    reject(new ApiErrorResponse(new Error(ErrorMessage.DocumentNotCreated), HttpStatus.CLIENT_ERROR_notFound))
                }
                else {
                    resolve(new ApiResponse(newDoc))
                }
            })
        })
    }

    public create(docs: T[]) {
        return new Promise<ApiResponse<T[]>>((resolve, reject) => {
            this.model.create(docs, (error: Error, newDocs: T[]): void => {
                if (error) {
                    reject(new ApiErrorResponse(error))
                }
                else if (!newDocs || !newDocs.length) {
                    reject(new ApiErrorResponse(new Error(ErrorMessage.DocumentsNotCreated), HttpStatus.CLIENT_ERROR_notFound))
                }
                else {
                    resolve(new ApiResponse(newDocs))
                }
            })
        })
    }

    public updateOne(id: string, doc: T) {
        return new Promise<ApiResponse<T>>((resolve, reject) => {
            this.model.findByIdAndUpdate(id, doc, { new: true }, (error: Error, newDoc: T) => {
                if (error) {
                    reject(new ApiErrorResponse(error))
                }
                else if (!newDoc) {
                    reject(new ApiErrorResponse(new Error(ErrorMessage.DocumentsNotUpdated), HttpStatus.CLIENT_ERROR_notFound))
                }
                else {
                    resolve(new ApiResponse(newDoc))
                }
            })
        })
    }

    public deleteOne(id: string) {
        return new Promise<ApiResponse<void>>((resolve, reject) => {
            this.model.findByIdAndRemove(id, (error: Error) => {
                if (error) {
                    reject(new ApiErrorResponse(error))
                }
                else {
                    resolve(new ApiResponse<void>())
                }
            })
        })
    }
}
