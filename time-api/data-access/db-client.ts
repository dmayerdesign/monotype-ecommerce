import * as JSONStream from 'JSONStream'
import { Response } from 'express'
import { injectable } from 'inversify'
import * as mongoose from 'mongoose'
import { Document, Error, Model, Types } from 'mongoose'

import { ErrorMessage } from '@time/common/constants/error-message'
import { prop, MongooseDocument, MongooseModel } from '@time/common/lib/goosetype'
import { SchemaError } from '@time/common/models/types/errors'
import { ListFromIdsRequest, ListFromQueryRequest, ListFromSearchRequest, ListRequest } from '../../time-common/models/api-requests/list.request'

interface PopulateOptions {
    path: string
    model?: MongooseModel<any>
    populate?: PopulateOptions
}

/**
 * Methods for querying the database
 *
 * @export
 * @class DbClient
 * @template T
 */
@injectable()
export class DbClient<T extends MongooseDocument<T>> {

    private loadOrStream<T extends MongooseDocument<T> = T>(model: MongooseModel, request: ListFromQueryRequest, res: Response): Promise<T[]> {
        const {
            skip,
            limit,
            sortBy,
            sortDirection,
            query,
        } = request

        return new Promise<T[]>(async (resolve, reject) => {
            if (res) {
                try {
                    model.find(query)
                        .skip(skip)
                        .limit(limit)
                        .sort({ [sortBy]: sortDirection })
                        .cursor()
                        .pipe(JSONStream.stringify())
                        .pipe(res.contentType('json'))

                    resolve()
                }
                catch (streamError) {
                    reject(streamError)
                }
            }

            // Fetch the data normally.

            else {
                try {
                    const documents = await model.find(query)
                        .skip(skip)
                        .limit(limit)
                        .sort({ [sortBy]: sortDirection })
                        .exec()

                    resolve(documents as (T & Document)[])
                }
                catch (fetchError) {
                    reject(fetchError)
                }
            }
        })
    }

    /**
     * Gets a paginated and filtered set of documents from a collection
     *
     * @param {mongoose.Model} model - Mongoose `Model` to query
     * @param {object} query - The database query
     * @param {boolean} res - Pass the express `Response` if the set of documents should be streamed rather than loaded into memory
     */
    public findQuery<T extends MongooseDocument<T> = T>(model: MongooseModel<T>, requestObject: ListFromQueryRequest, res?: Response): Promise<T[]> {
        const request = new ListFromQueryRequest(requestObject)
        return this.loadOrStream<T>(model, request, res)
    }

    /**
     * Find some documents
     *
     * @param {MongooseModel<T>} model The Mongoose `Model` representing the collection containing the document
     * @param {ListRequest} request
     * @memberof DbClient
     */
    public find<T extends MongooseDocument<T> = T>(model: MongooseModel<T>, requestObject: ListRequest, res?: Response): Promise<T[]> {
        const request = new ListFromQueryRequest({
            ...requestObject,
            query: {},
        })
        return this.loadOrStream<T>(model, request, res)
    }

    /**
     * Find some documents using a search string
     *
     * @param {MongooseModel<T>} model The Mongoose `Model` representing the collection containing the document
     * @param {ListRequest} request
     * @memberof DbClient
     */
    public findWithSearch<T extends MongooseDocument<T> = T>(model: MongooseModel<T>, { search, searchFields, skip, limit, sortBy, sortDirection }: ListFromSearchRequest, res?: Response): Promise<T[]> {
        return new Promise<T[]>(async (resolve, reject) => {
            try {
                const searchQuery = { $and: [] }
                const searchRegExp = search ? new RegExp(search, 'gi') : undefined
                const searchQueryElements: {
                    [key: string]: { $regex: RegExp }
                }[] = []
                if (searchRegExp) {
                    searchFields.forEach((searchField) => {
                        searchQueryElements.push({
                            [searchField]: {
                                $regex: searchRegExp
                            }
                        })
                    })
                    searchQuery.$and = searchQuery.$and.concat(searchQueryElements)
                }

                const request = new ListFromQueryRequest({
                    skip,
                    limit,
                    sortBy,
                    sortDirection,
                    query: searchQuery
                })
                const documents: T[] = await this.loadOrStream<T>(model, request, res)
                resolve(documents)
            }
            catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Find some documents using an array of `ObjectId`s
     *
     * @param {MongooseModel<T>} model The Mongoose `Model` representing the collection containing the document
     * @param {string[]} ids An array of `ObjectId`s
     * @memberof DbClient
     */
    public findIds<T extends MongooseDocument<T> = T>(model: MongooseModel<T>, request: ListFromIdsRequest): Promise<T[]> {
        return new Promise<T[]>(async (resolve, reject) => {
            try {
                const documents = await model.find({
                    _id: { $in: request.ids }
                }).exec()
                resolve(documents)
            }
            catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Find a document. Optionally, perform a series of Mongoose `populate`s.
     *
     * @param {MongooseModel<T>} model The Mongoose `Model` representing the collection containing the document
     * @param {object} query The query passed to `Model.findOne`
     * @memberof DbClient
     */
    public findOne<T extends MongooseDocument<T> = T>(model: MongooseModel<T>, query: object, populateOptionsArr?: PopulateOptions[]): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            let notFound = false
            try {
                const findQuery = model.findOne(query)

                if (populateOptionsArr) {
                    populateOptionsArr.forEach((populateOptions) => {
                        findQuery.populate(populateOptions)
                    })
                }

                const documentResult = await findQuery.exec()
                if (documentResult) {
                    const document = documentResult._doc
                    resolve(document)
                }
                else {
                    notFound = true
                    throw new Error('Document not found.')
                }
            }
            catch (error) {
                if (notFound) {
                    resolve(null)
                }
                else {
                    reject(error)
                }
            }
        })
    }

    /**
     * Find a document by `id`
     *
     * @param {MongooseModel<T>} model The Mongoose `Model` representing the collection containing the document
     * @param {string} id The id passed to `Model.findById`
     * @memberof DbClient
     */
    public findById<T extends MongooseDocument<T> = T>(model: MongooseModel<T>, id: string): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            try {
                const documentResult: any = await model.findById(id).exec()
                if (documentResult) {
                    const document: T = documentResult._doc
                    resolve(document)
                }
                else {
                    throw new Error('Document not found.')
                }
            }
            catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Update a document by `id`
     *
     * @param {mongoose.Model} model The Mongoose `Model` representing the collection containing the document
     * @param {ObjectId|string} id The document's `<ObjectId>_id` field
     * @param {object} update An object representing the fields to be updated
     * @param {boolean} addToArrays Set to `false` if fields should be replaced in the same way as other fields, using a MongoDB `$set`. Defaults to `true`, meaning that fields containing arrays are treated as additions to the existing array using MongoDB's `$addToSet` operator
     * @memberof DbClient
     */
    public update<T extends MongooseDocument<T> = T>(model: MongooseModel<T>, ids: (string|Types.ObjectId)[], update: object, addToArrays = true): Promise<T[]> {
        return new Promise<T[]>(async (resolve, reject) => {
            let documents: T[]

            if (addToArrays) {
                const $addToSet: any = {}

                Object.keys(update).forEach((key) => {
                    if (Array.isArray(update[key])) {
                        $addToSet[key] = [ ...update[key] ]
                        delete update[key]
                    }
                })

                try {
                    documents = await model.updateMany({ _id: { $in: ids } }, {
                        $set: update,
                        $addToSet
                    }).exec()
                }
                catch (retrievalError) {
                    reject(retrievalError)
                    return
                }
            }
            else {
                try {
                    documents = await model.updateMany({ _id: { $in: ids } }, { $set: update })
                }
                catch (retrievalError) {
                    reject(retrievalError)
                    return
                }
            }

            resolve(documents)
        })
    }

    /**
     * Update a document by `id`
     *
     * @param {mongoose.Model} model The Mongoose `Model` representing the collection containing the document
     * @param {ObjectId|string} id The document's `<ObjectId>_id` field
     * @param {object} update An object representing the fields to be updated
     * @param {boolean} concatArrays Set to `true` if fields containing arrays should be treated as additions to the existing array. Defaults to `false`, meaning that arrays are replaced in the same way as other fields
     * @memberof DbClient
     */
    public updateById<T extends MongooseDocument<T> = T>(model: MongooseModel<T>, id: string|Types.ObjectId, update: Object, concatArrays = true): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            let document: T
            try {
                document = await model.findById(id).exec()
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

        function updateDoc(doc: T & Document, iterable: object) {
            if (!iterable || !Object.keys(iterable) || !Object.keys(iterable).length) {
                throw new SchemaError('Invalid update')
            }

            Object.keys(model).forEach(key => {
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
     * Create several documents using Model#create.
     *
     * @param {MongooseModel<T>} model
     * @param {T[]} docs
     * @returns {Promise<T[]>}
     * @memberof DbClient
     */
    public create<T extends MongooseDocument<T> = T>(model: MongooseModel<T>, docs: T[]): Promise<T[]> {
        return new Promise<T[]>(async (resolve, reject) => {
            try {
                const newDocs = await model.create(docs)

                if (!newDocs || !newDocs.length) {
                    reject(new Error(ErrorMessage.DocumentsNotCreated))
                }
                else {
                    resolve(newDocs)
                }
            }
            catch (createError) {
                reject(createError)
            }
        })
    }

    public delete<T extends MongooseDocument<T> = T>(model: MongooseModel<T>, id: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await model.findByIdAndRemove(id).exec()
                resolve()
            }
            catch (deleteError) {
                reject(deleteError)
            }
        })
    }
}
