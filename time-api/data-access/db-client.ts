import * as JSONStream from 'JSONStream'
import { Response } from 'express'
import { injectable } from 'inversify'
import * as mongoose from 'mongoose'
import { Document, Error, Model, Types } from 'mongoose'

import { ApiResponse } from '@time/common/models/helpers'
import { SchemaError } from '@time/common/models/types/errors'
import { prop, IMongooseModel, MongooseDocument } from '@time/common/utils/goosetype'

@injectable()
export class DbClient<T extends MongooseDocument<T>> {

    /**
     * Gets a filtered set of documents from a collection
     *
     * @param {mongoose.Model} model - Mongoose `Model` to query
     * @param {object} query - The database query
     * @param {boolean} res - Pass the express `Response` if the set of documents should be streamed rather than loaded into memory
     */
    public getFilteredCollection(model: IMongooseModel<T>, query: Object, options?: { limit: number; skip: number }, res?: Response): Promise<T[]> {

        if (!options) {
            options = { limit: 0, skip: 0 }
        }
        if (options && !options.limit) {
            options.limit = 0
        }
        if (options && !options.skip) {
            options.skip = 0
        }

        return new Promise<T[]>(async (resolve, reject) => {

            // Stream the data

            if (res) {
                try {
                    model.find(query)
                        .skip(options.skip)
                        .limit(options.limit)
                        .cursor()
                        .pipe(JSONStream.stringify())
                        .pipe(res)

                    resolve()
                }
                catch (streamError) {
                    reject(streamError)
                }
            }

            // Fetch the data normally

            else {
                try {
                    const documents = await model.find(query)
                        .skip(options.skip)
                        .limit(options.limit)
                    resolve(documents as (T & Document)[])
                }
                catch (fetchError) {
                    reject(fetchError)
                }
            }
        })
    }

    /**
     * Find some documents
     *
     * @param {IMongooseModel<T>} model The Mongoose `Model` representing the collection containing the document
     * @param {object} query The query passed to `Model.findOne`
     * @memberof DbClient
     */
    public find(model: IMongooseModel<T>, query: object) {
        return new Promise<T[]>(async (resolve, reject) => {
            let documents: T[]

            try {
                documents = await model.find(query)
                resolve(documents)
            }
            catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Find a document
     *
     * @param {IMongooseModel<T>} model The Mongoose `Model` representing the collection containing the document
     * @param {object} query The query passed to `Model.findOne`
     * @memberof DbClient
     */
    public findOne(model: IMongooseModel<T>, query: object) {
        return new Promise<T>(async (resolve, reject) => {
            let document: T
            let documentResult: any

            try {
                documentResult = await model.findOne(query)
                document = documentResult._doc
                resolve(document)
            }
            catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Find a document by `id`
     *
     * @param {IMongooseModel<T>} model The Mongoose `Model` representing the collection containing the document
     * @param {string} id The id passed to `Model.findById`
     * @memberof DbClient
     */
    public findById(model: IMongooseModel<T>, id: string) {
        return new Promise<T>(async (resolve, reject) => {
            let document: T
            let documentResult: any

            try {
                documentResult = await model.findById(id)
                document = documentResult._doc
                resolve(document)
            }
            catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Update a document by `id`
     *
     * @param {mongoose.Model} model - The Mongoose `Model` representing the collection containing the document
     * @param {ObjectId|string} id - The document's `<ObjectId>_id` field
     * @param {object} update - An object representing the fields to be updated
     * @param {boolean} concatArrays - Set to `true` if fields containing arrays should be treated as additions to the existing array. Defaults to `false`, meaning that arrays are replaced in the same way as other fields
     * @memberof DbClient
     */
    public updateById(model: IMongooseModel<T>, id: string|Types.ObjectId, update: Object, concatArrays: boolean = false) {
        return new Promise<T>(async (resolve, reject) => {
            let document: T
            try {
                document = await model.findById(id)
            }
            catch (retrievalError) {
                reject(retrievalError)
                return
            }

            try {
                updateDoc(document as T & Document, update)
            }
            catch (validationError) {
                reject(validationError)
                return
            }

            try {
                const updatedDocumentResult = await document.save()
                const updatedDocument = updatedDocumentResult._doc
                resolve(updatedDocument)
            }
            catch (updateError) {
                reject(updateError)
            }
        })

        function updateDoc(doc: T & Document, iterable: Object) {
            if (!iterable || !Object.keys(iterable) || !Object.keys(iterable).length) {
                throw new SchemaError('Invalid update')
            }

            Object.keys(iterable).forEach(key => {
                if (iterable[key] && iterable[key].constructor === Object) {
                    updateDoc(doc[key], iterable[key])
                }
                else if (concatArrays && Array.isArray(iterable[key])) {
                    doc[key] = doc[key].concat(iterable[key])
                }
                else {
                    doc[key] = iterable[key]
                }
            })
        }
    }

    /**
     * Returns a MongoDB "set" operator based on a GraphQL-style object
     *
     * @param {object} obj - An object representing the fields to be updated
     */
    public mongoSet(obj: Object): Object {
        const operator = { $set: {} }

        function addToSetOperator(iterable: Object, prefix?: string) {
            Object.keys(iterable).forEach(key => {
                let newKey: string, newPrefix: string
                if (iterable[key] && iterable[key].constructor === Object) {
                    newPrefix = prefix ? prefix + "." + key : key
                    addToSetOperator(iterable[key], newPrefix)
                }
                else {
                    newKey = prefix ? prefix + "." + key : key
                    operator.$set[newKey] = iterable[key]
                }
            })
        }

        addToSetOperator(obj)
        return operator
    }
}
