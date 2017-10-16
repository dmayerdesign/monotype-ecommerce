import { inject, injectable } from 'inversify'
import { Error } from 'mongoose'

import { DbClient } from '@time/common/api-utils'
import { Types } from '@time/common/constants/inversify'
import { Discount } from '@time/common/models/api-models'
import { ApiResponse, ServiceErrorResponse } from '@time/common/models/helpers'
import { IFetchService } from '@time/common/models/interfaces'
import { IDiscount, IPrice } from '@time/common/models/interfaces'

/**
 * Service for fetching documents from the `discounts` collection
 */
@injectable()
export class DiscountService implements IFetchService<IDiscount> {

    /**
     * Instantiate the service
     *
     * @param {DbClient<IDiscount>} dbClient A service containing helper methods for database operations
     * @param {DiscountSearchUtils} discountSearchUtils A service containing helper methods for discount search
     */
    constructor(
        @inject(Types.DbClient) private dbClient: DbClient<IDiscount>,
    ) {}

    /**
     * Get a single discount
     *
     * @param {string} id The `_id` of the discount to be retrieved
     * @return {Promise<IDiscount>}
     */
    public getOne(id: string): Promise<ApiResponse<IDiscount>> {
        return new Promise<ApiResponse<IDiscount>>((resolve, reject) => {
            Discount.findById(id, (error: Error, discount): void => {
                if (error) reject(new ServiceErrorResponse(error))
                else resolve(new ApiResponse(discount))
            })
        })
    }

    /**
     * Retrieve a list of discounts
     *
     * @param {object} query The database query
     * @return {Promise<IDiscount>}
     */
    public get(query: object): Promise<ApiResponse<IDiscount[]>> {
        return new Promise<ApiResponse<IDiscount[]>>((resolve, reject) => {
            // Retrieve the discounts normally, loading them into memory
            this.dbClient.getFilteredCollection(Discount, query)
                .then(discounts => resolve(new ApiResponse(discounts)))
                .catch(err => reject(new ServiceErrorResponse(err)))
        })
    }
}
