import { HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'

import { IUser } from '../../models/interfaces'
import { SimpleError } from './http.models'

@Injectable()
export class TimeHttpService {
    public error$ = new ReplaySubject<SimpleError>()
    public sessionInvalid$ = new ReplaySubject<SimpleError>()
}
