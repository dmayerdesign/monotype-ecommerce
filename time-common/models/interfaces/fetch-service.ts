import * as express from 'express'
import { IApiResponse } from './api-response'

export interface IFetchService<T> {
    getOne(id: string): Promise<IApiResponse<T>>
    get(query: object, queryOptions: { page: number; limit: number }, res?: express.Response): Promise<IApiResponse<T[]>>|void
}
