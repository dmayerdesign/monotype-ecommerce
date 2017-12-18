import { inject, injectable } from 'inversify'
import * as mongoose from 'mongoose'
import { Error } from 'mongoose'

import { Types } from '@time/common/constants/inversify'
import { Discount, DiscountModel } from '@time/common/models/api-models/discount'
import { ApiErrorResponse, ApiResponse } from '@time/common/models/helpers'
import { IFetchService } from '@time/common/models/interfaces/fetch-service'
import { IMongooseModel } from '@time/common/utils/goosetype'
import { DbClient } from '../data-access/db-client'

/**
 * Service for fetching documents from the `discounts` collection
 */
@injectable()
export class DiscountService implements IFetchService<Discount> {

    /**
     * Instantiate the service
     *
     * @param {DbClient<Discount>} dbClient A service containing helper methods for database operations
     */
    constructor(
        @inject(Types.DbClient) private dbClient: DbClient<Discount>,
    ) {}

    /**
     * Get a single discount
     *
     * @param {string} id The `_id` of the discount to be retrieved
     * @return {Promise<Discount>}
     */
    public getOne(id: string): Promise<ApiResponse<Discount>> {
        return new Promise<ApiResponse<Discount>>(async (resolve, reject) => {
            try {
                const discount = await this.dbClient.findById(DiscountModel, id)
                resolve(new ApiResponse(discount))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    /**
     * Retrieve a list of discounts
     *
     * @param {object} query The database query
     * @return {Promise<Discount>}
     */
    public get(query: object): Promise<ApiResponse<Discount[]>> {
        return new Promise<ApiResponse<Discount[]>>((resolve, reject) => {
            // Retrieve the discounts normally, loading them into memory
            this.dbClient.getFilteredCollection(DiscountModel as IMongooseModel<Discount>, query)
                .then(discounts => resolve(new ApiResponse(discounts)))
                .catch(err => reject(new ApiErrorResponse(err)))
        })
    }
}
