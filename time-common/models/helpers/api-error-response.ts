import { HttpStatus } from '../../constants/http'

export class ApiErrorResponse {
    constructor(
        public error: Error,
        public status: HttpStatus = 500,
    ) {}
}
