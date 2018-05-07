import { Response } from 'express'
import { injectable } from 'inversify'
import { Error } from 'mongoose'

import { HttpStatus } from '@mte/common/constants/http-status'
import { MongooseDocument, MongooseModel } from '@mte/common/lib/goosetype'
import { ListFromIdsRequest, ListFromQueryRequest, ListRequest } from '@mte/common/models/api-requests/list.request'
import { ApiErrorResponse } from '@mte/common/models/api-responses/api-error.response'
import { ApiResponse } from '@mte/common/models/api-responses/api.response'
import { DbClient } from '../data-access/db-client'

/**
 * Base class for API services requiring CRUD functionality.
 */
@injectable()
export abstract class CrudService<T extends MongooseDocument> {

    protected abstract model: MongooseModel<T>
    protected abstract dbClient: DbClient<T>

    protected listRequestType = ListRequest
    protected listFromIdsRequestType = ListFromIdsRequest

    public getQuery(requestObject: ListFromQueryRequest, res: Response) {
        return new Promise<ApiResponse<T[]>>(async (resolve, reject) => {
            try {
                const data = await this.dbClient.findQuery(this.model, requestObject, res)
                resolve(new ApiResponse(data))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public get(requestObject: ListRequest) {
        const request = new this.listRequestType(requestObject)

        return new Promise<ApiResponse<T[]>>(async (resolve, reject) => {
            try {
                const data = await this.dbClient.find(this.model, request)
                resolve(new ApiResponse(data))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public getIds(requestObject: ListFromIdsRequest) {
        const request = new this.listFromIdsRequestType(requestObject)

        return new Promise<ApiResponse<T[]>>(async (resolve, reject) => {
            try {
                const data = await this.dbClient.findIds(this.model, request)
                resolve(new ApiResponse(data))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public getOne(id: string) {
        return new Promise<ApiResponse<T>>(async (resolve, reject) => {
            try {
                const data = await this.dbClient.findById(this.model, id)
                resolve(new ApiResponse(data))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public create(docs: T[]) {
        return new Promise<ApiResponse<T[]>>(async (resolve, reject) => {
            try {
                const newDocs = await this.dbClient.create(this.model, docs)
                resolve(new ApiResponse(newDocs))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public createOne(doc: T) {
        return new Promise<ApiResponse<T>>(async (resolve, reject) => {
            try {
                const newDoc = await new this.model(doc).save()
                resolve(new ApiResponse(newDoc))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public update(ids: string[], updateObj: object, concatArrays?: boolean) {
        return new Promise<ApiResponse<T[]>>(async (resolve, reject) => {
            try {
                const updatedDocs = await this.dbClient.update(this.model, ids, updateObj, concatArrays)
                resolve(new ApiResponse(updatedDocs))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public updateOne(id: string, updateObj: object, concatArrays?: boolean) {
        return new Promise<ApiResponse<T>>(async (resolve, reject) => {
            try {
                const updatedDoc = await this.dbClient.updateById(this.model, id, updateObj, concatArrays)
                resolve(new ApiResponse(updatedDoc))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    public deleteOne(id: string) {
        return new Promise<ApiResponse<void>>(async (resolve, reject) => {
            try {
                await this.dbClient.delete(this.model, id)
                resolve(new ApiResponse<void>())
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }
}
