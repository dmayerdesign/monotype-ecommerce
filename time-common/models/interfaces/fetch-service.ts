import * as express from 'express'
import { IServiceResponse } from './service-response'

export interface IFetchService<T> {
    getOne(id: string): Promise<IServiceResponse<T>>
    get(query: object, page: number, res?: express.Response): Promise<IServiceResponse<T[]>>
}
