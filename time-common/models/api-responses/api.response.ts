import { HttpStatus } from '../../constants/http'
import { IApiResponse } from '../interfaces/api/api-response'

export class ApiResponse<T> implements IApiResponse<T> {
    constructor(
        public body: T = {} as T,
        public status: HttpStatus = 200,
    ) {}
}
