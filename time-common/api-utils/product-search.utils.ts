import { injectable } from 'inversify';
import { ProductSearch, MongoQueries } from './';

@injectable()
export class ProductSearchUtils {

    public propertyFilter(filter: ProductSearch.Filter, query: MongoQueries.And): MongoQueries.And {
        if (filter.values && filter.values.length) {
            let propertyVOs = [];
            filter.values.forEach(val => {
                let propertyVO: any = {};
                propertyVO[filter.key] = val;
                propertyVOs.push(propertyVO);
            });
            query.$and.push({ $or: propertyVOs });
        }
        if (filter.range) {
            let lowerLimit = {};
            let upperLimit = {};
            lowerLimit[filter.key] = { $gte: filter.range[0] };
            upperLimit[filter.key] = { $lte: filter.range[1] };
            query.$and.push(lowerLimit);
            query.$and.push(upperLimit);
        }
        return { ...query };
    }

    public attributeFilter(filter: ProductSearch.Filter, query: MongoQueries.And): MongoQueries.And {
        let attributeVOs = [];
        if (filter.values && filter.values.length) {
            filter.values.forEach(attributeValue => {
                attributeVOs.push({ value: attributeValue });
            });
            query.$and.push({
                attributes: {
                    $elemMatch: { key: filter.key, $or: attributeVOs },
                },
            });
        }
        if (filter.range) {
            let lowerLimit = {};
            let upperLimit = {};
            lowerLimit[filter.key] = { value: { $gte: filter.range[0] } };
            upperLimit[filter.key] = { value: { $lte: filter.range[1] } };

            attributeVOs = [lowerLimit, upperLimit];

            query.$and.push({
                attributes: {
                    $elemMatch: { key: filter.key, $and: attributeVOs },
                },
            });
        }
        return { ...query };
    }

    public taxonomyFilter(filter: ProductSearch.Filter, query: MongoQueries.And): MongoQueries.And {
        if (filter.values && filter.values.length) {
            let taxonomyVOs = [];
            filter.values.forEach(val => {
                const filterItem = {
                    values: val,
                };
                taxonomyVOs.push(filterItem);
            });
            query.$and.push({
                taxonomies: {
                    $elemMatch: { key: filter.key, $or: taxonomyVOs },
                },
            });
        }
        return { ...query };
    }
}