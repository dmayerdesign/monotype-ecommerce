import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs/ReplaySubject'

import { SimpleError } from './http.models'

@Injectable()
export class TimeHttpService {
    public errors = new ReplaySubject<SimpleError>()
    public sessionInvalids = new ReplaySubject<SimpleError>()
}
