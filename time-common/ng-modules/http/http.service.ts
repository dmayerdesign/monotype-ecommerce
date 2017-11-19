import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs/ReplaySubject'

import { SimpleError } from './http.models'

@Injectable()
export class TimeHttpService {
    public error$ = new ReplaySubject<SimpleError>()
    public sessionInvalid$ = new ReplaySubject<SimpleError>()
}
