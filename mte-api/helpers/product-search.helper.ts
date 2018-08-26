import { GetProductsFilter } from '@mte/common/api/requests/get-products.request'
import { injectable } from 'inversify'
import { cloneDeep } from 'lodash'
import { MongoHelper } from './mongo.helper'

@injectable()
export class ProductSearchHelper {

    public propertyFilter(filter: GetProductsFilter, query: typeof MongoHelper.andOperation): typeof MongoHelper.andOperation {
        const newQuery = cloneDeep(query)

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
                [filter.key]: { $gte: filter.range.min },
            }
            const upperLimit: any = {
                [filter.key]: { $lte: filter.range.max },
            }

            newQuery.$and = newQuery.$and.concat([lowerLimit, upperLimit])
        }
        return newQuery
    }

    public simpleAttributeValueFilter(filter: GetProductsFilter, query: typeof MongoHelper.andOperation): typeof MongoHelper.andOperation {
        const newQuery = cloneDeep(query)
        let attributeVOs: { value: any }[] = []

        if (filter.values && filter.values.length) {
            attributeVOs = filter.values.map(attributeValue => {
                return { value: attributeValue }
            })
            newQuery.$and.push({
                $or: [
                    {
                        simpleAttributeValues: {
                            $elemMatch: {
                                attribute: filter.key,
                                $or: attributeVOs,
                            },
                        },
                    },
                    {
                        variableSimpleAttributeValues: {
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
                    value: { $gte: filter.range.min },
                }
            }
            const upperLimit: any = {
                [filter.key]: {
                    value: { $lte: filter.range.max },
                }
            }

            attributeVOs = [lowerLimit, upperLimit]

            newQuery.$and.push({
                $or: [
                    {
                        simpleAttributeValues: {
                            $elemMatch: {
                                attribute: filter.key,
                                $and: attributeVOs,
                            },
                        },
                    },
                    {
                        variableSimpleAttributeValues: {
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

    public attributeValueFilter(filter: GetProductsFilter, query: typeof MongoHelper.andOperation): typeof MongoHelper.andOperation {
        const newQuery = cloneDeep(query)
        const ids = filter.values

        if (ids && ids.length) {
            newQuery.$and.push({
                $or: [
                    { attributeValues: { $in: ids } },
                    { variableAttributeValues: { $in: ids } },
                ],
            })
        }

        return newQuery
    }

    // Reminder: parents and variations must share the same taxonomy terms.
    public taxonomyTermFilter(ids: string[], query: typeof MongoHelper.andOperation): typeof MongoHelper.andOperation {
        const newQuery = cloneDeep(query)

        if (ids && ids.length) {
            newQuery.$and.push({
                taxonomyTerms: { $in: ids },
            })
        }

        return newQuery
    }
}
