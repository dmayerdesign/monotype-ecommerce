import { HttpStatus } from '../../constants/http'

export class ApiErrorResponse {
    public message: string
    public name: string
    public stack: any

    constructor(
        error: Error,
        public status?: HttpStatus,
    ) {
        if (error) {
            this.message = error.message
            this.name = error.name
            this.stack = error.stack
        }
    }
}
