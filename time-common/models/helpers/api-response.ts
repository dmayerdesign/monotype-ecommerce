import { HttpStatus } from '../../constants/http'
import { IApiResponse } from '../interfaces'

export class ApiResponse<T> implements IApiResponse<T> {
    constructor(
        public data: T = <T>{},
        public status: HttpStatus = 200,
    ) {}
}
