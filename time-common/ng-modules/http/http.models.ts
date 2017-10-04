import { HttpErrorResponse } from '@angular/common/http'
import { IUser } from '../../models/interfaces'

export class TimeHttpResponse {
    public user?: IUser
    public payload: any
}

export class SimpleError {
    public message: string
    public status: number

    constructor(error?: HttpErrorResponse) {
        this.message = error ? error.error : undefined
        this.status = error ? error.status : undefined
    }
}
