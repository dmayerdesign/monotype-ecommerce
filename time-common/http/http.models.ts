import { HttpErrorResponse } from '@angular/common/http'
import { IUser } from '../models/interfaces'

export class TimeHttpResponse {
    public user?: IUser
    public payload: any
}

export class SimpleError {
    public message: string
    public status: number

    constructor(error?: HttpErrorResponse) {
        console.error(error)
        this.message = error ? error.error : null
        this.status = error ? error.status : null
    }
}
