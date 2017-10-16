import { HttpStatus } from '../../constants/http'
import { IApiResponse } from '../interfaces'

export class ApiResponse<T> implements IApiResponse<T> {
    constructor(
        public data: T = null,
        public status: HttpStatus = 200,
    ) {}
}
