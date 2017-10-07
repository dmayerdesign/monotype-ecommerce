import { HttpStatus } from '../../constants/http'

export class ServiceErrorResponse {
    constructor(
        public error: Error,
        public status: HttpStatus = 500,
    ) {}
}
