import { HttpStatus } from '../../constants/http'
import { IServiceResponse } from '../interfaces'

export class ServiceResponse<T> implements IServiceResponse<T> {
    constructor(
        public data: T = null,
        public status: HttpStatus = 200,
    ) {}
}
