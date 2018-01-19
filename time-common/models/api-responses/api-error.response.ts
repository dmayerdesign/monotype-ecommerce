import { HttpStatus } from '../../constants/http'

export class ApiErrorResponse {
    public message: string
    public name: string
    public stack: any

    constructor(
        error: Error,
        public status: HttpStatus = HttpStatus.SERVER_ERROR_internal,
    ) {
        if (error) {
            this.message = error.message
            this.name = error.name
            this.stack = error.stack
        }
    }
}
