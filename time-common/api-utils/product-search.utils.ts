import { injectable } from 'inversify'
import { ProductSearch, MongoQueries } from './'

@injectable()
export class ProductSearchUtils {

    public propertyFilter(filter: ProductSearch.Filter, query: MongoQueries.And): MongoQueries.And {
        let newQuery = { ...query }

        if (filter.values && filter.values.length) {
            let propertyVOs = []
            filter.values.forEach(val => {
                let propertyVO: any = {}
                propertyVO[filter.key] = val
                propertyVOs.push(propertyVO)
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

    public attributeKeyValueFilter(filter: ProductSearch.Filter, query: MongoQueries.And): MongoQueries.And {
        let newQuery = { ...query }
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

    public attributeValueFilter(filter: ProductSearch.Filter, query: MongoQueries.And): MongoQueries.And {
        let newQuery = { ...query }
        let attributeValueIds = []

        if (filter.values && filter.values.length) {
            attributeValueIds = filter.values.map(valueId => {
                return { valueId }
            })
            newQuery.$and.push({
                $or: [
                    {
                        "attributeValues.valueId": {
                            $in: attributeValueIds,
                        },
                    },
                    {
                        "variableAttributeValues.valueId": {
                            $in: attributeValueIds,
                        },
                    },
                ],
            })
        }

        return newQuery
    }

    public taxonomyFilter(filter: ProductSearch.Filter, query: MongoQueries.And): MongoQueries.And {
        let newQuery = { ...query }

        if (filter.values && filter.values.length) {
            let taxonomyVOs = []
            filter.values.forEach(val => {
                const filterItem = {
                    values: val,
                }
                taxonomyVOs.push(filterItem)
            })
            newQuery.$and.push({
                taxonomies: {
                    $elemMatch: { key: filter.key, $or: taxonomyVOs },
                },
            })
        }
        return newQuery
    }
}