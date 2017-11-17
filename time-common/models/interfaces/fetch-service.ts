import * as express from 'express'

import { GetProductsRequest } from '../api-requests/get-products.request'
import { IApiResponse } from './api-response'
import { IDbQueryOptions } from './db-query-options'

export abstract class IFetchService<T> {
    public abstract getOne(key: string): Promise<IApiResponse<T>>
    public abstract get(query: GetProductsRequest, res?: express.Response): Promise<IApiResponse<T[]>>|void
}
