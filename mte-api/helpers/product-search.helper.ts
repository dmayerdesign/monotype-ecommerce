import { injectable } from 'inversify'

import { GetProductsFilter } from '@mte/common/models/api-requests/get-products.request'
import { MongoHelper } from './mongo.helper'

@injectable()
export class ProductSearchHelper {

    public propertyFilter(filter: GetProductsFilter, query: MongoHelper.AndOperation): MongoHelper.AndOperation {
        const newQuery = { ...query }

        if (filter.values && filter.values.length) {
            const propertyVOs = filter.values.map(val => {
                return {
                    [filter.key]: val
                }
            })
            newQuery.$and.push({ $or: propertyVOs })
        }
        if (filter.range) {
            const lowerLimit: any = {
                [filter.key]: { $gte: filter.range[0] },
            }
            const upperLimit: any = {
                [filter.key]: { $lte: filter.range[1] },
            }

            newQuery.$and = newQuery.$and.concat([lowerLimit, upperLimit])
        }
        return newQuery
    }

    public attributeKeyValueFilter(filter: GetProductsFilter, query: MongoHelper.AndOperation): MongoHelper.AndOperation {
        const newQuery = { ...query }
        let attributeVOs = []

        if (filter.values && filter.values.length) {
            attributeVOs = filter.values.map(attributeValue => {
                return { value: attributeValue }
            })
            newQuery.$and.push({
                $or: [
                    {
                        attributeValues: {
                            $elemMatch: {
                                attribute: filter.key,
                                $or: attributeVOs,
                            },
                        },
                    },
                    {
                        variableAttributeValues: {
                            $elemMatch: {
                                attribute: filter.key,
                                $or: attributeVOs,
                            },
                        },
                    },
                ],
            })
        }
        if (filter.range) {
            const lowerLimit: any = {
                [filter.key]: {
                    value: { $gte: filter.range[0] },
                }
            }
            const upperLimit: any = {
                [filter.key]: {
                    value: { $lte: filter.range[1] },
                }
            }

            attributeVOs = [lowerLimit, upperLimit]

            newQuery.$and.push({
                $or: [
                    {
                        attributeValues: {
                            $elemMatch: {
                                attribute: filter.key,
                                $and: attributeVOs,
                            },
                        },
                    },
                    {
                        variableAttributeValues: {
                            $elemMatch: {
                                attribute: filter.key,
                                $and: attributeVOs,
                            },
                        },
                    },
                ],
            })
        }
        return newQuery
    }

    public attributeValueFilter(filter: GetProductsFilter, query: MongoHelper.AndOperation): MongoHelper.AndOperation {
        const newQuery = { ...query }
        let attributeValueIds = []

        if (filter.values && filter.values.length) {
            attributeValueIds = filter.values.map(valueId => {
                return { valueId }
            })
            newQuery.$and.push({
                $or: [
                    {
                        'attributeValues.valueId': {
                            $in: attributeValueIds,
                        },
                    },
                    {
                        'variableAttributeValues.valueId': {
                            $in: attributeValueIds,
                        },
                    },
                ],
            })
        }

        return newQuery
    }

    // Reminder: parents and variations must share the same taxonomy terms.
    public taxonomyFilter(filter: GetProductsFilter, query: MongoHelper.AndOperation): MongoHelper.AndOperation {
        const newQuery = { ...query }

        if (filter.values && filter.values.length) {
            newQuery.$and.push({
                $or: [
                    { taxonomyTerms: filter.values },
                    { taxonomyTermSlugs: filter.values },
                ],
            })
        }

        return newQuery
    }
}
