import { HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { IUser } from '../../models'
import { SimpleError } from './http.models'

@Injectable()
export class TimeHttpService {
    public error$ = new Subject<SimpleError>()
    public auth$ = new Subject<string>()
}
