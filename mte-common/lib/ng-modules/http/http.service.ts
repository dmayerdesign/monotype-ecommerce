import { Injectable } from '@angular/core'
import { SimpleError } from '@mte/common/lib/ng-modules/http/http.models'
import { ReplaySubject } from 'rxjs'

@Injectable()
export class MteHttpService {
    public errors = new ReplaySubject<SimpleError>()
    public sessionInvalids = new ReplaySubject<SimpleError>()
}
