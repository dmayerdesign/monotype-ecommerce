import * as JSONStream from 'JSONStream'
import { Response } from 'express'
import { injectable } from 'inversify'
import { Document, Error, Model, Types } from 'mongoose'
import { Typegoose } from 'typegoose'

import { SchemaError } from '@time/common/models/types/errors'

@injectable()
export class DbClient<T extends Document|Typegoose> {
    /**
     * Gets a filtered set of documents from a collection
     *
     * @param {mongoose.Model} model - Mongoose `Model` to query
     * @param {object} query - The database query
     * @param {boolean} res - Pass the express `Response` if the set of documents should be streamed rather than loaded into memory
     */
    public getFilteredCollection(model: Model<T & Document>, query: Object, options?: { limit: number; skip: number }, res?: Response): Promise<T[]> {
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
            /**
             * Stream the data
             */
            if (res) {
                try {
                    await model.find(query)
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
            /**
             * Fetch the data normally
             */
            else {
                model.find(query)
                    .skip(options.skip)
                    .limit(options.limit)
                    .then(documents => resolve(documents))
                    .catch(fetchError => reject(fetchError))
            }
        })
    }

    /**
     * Updates a document
     *
     * @param {mongoose.Model} model - The Mongoose `Model` representing the collection containing the document
     * @param {ObjectId|string} id - The document's `<ObjectId>_id` field
     * @param {object} update - An object representing the fields to be updated
     * @param {boolean} concatArrays - Set to `true` if fields containing arrays should be treated as additions to the existing array. Defaults to `false`, meaning that arrays are replaced in the same way as other fields
     */
    public updateById(model: Model<T & Document>, id: string|Types.ObjectId, update: Object, concatArrays: boolean = false): Promise<T> {

        return new Promise<T>((resolve, reject) => {
            model.findById(id)
                .then(document => {
                    try {
                        updateDoc(document, update)
                    }
                    catch (validationError) {
                        reject(validationError)
                        return
                    }
                    document.save()
                        .then(updatedDocument => resolve(updatedDocument))
                        .catch((updateError: Error) => reject(updateError))
                })
                .catch((retrievalError: Error) => reject(retrievalError))
        })

        function updateDoc(doc: T, iterable: Object) {
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
