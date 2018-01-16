import { HttpStatus } from '../../constants/http'
import { IApiResponse } from '../interfaces/api/api-response'

export class ApiResponse<T> implements IApiResponse<T> {
    constructor(
        public data: T = <T>{},
        public status: HttpStatus = 200,
    ) {}
}
