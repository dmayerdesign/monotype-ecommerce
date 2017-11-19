import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'

import { HttpStatus } from '../../constants'
import { SimpleError } from './http.models'
import { TimeHttpService } from './http.service'

@Injectable()
export class TimeHttpResponseInterceptor implements HttpInterceptor {

    constructor(
        private timeHttpService: TimeHttpService
    ) {}

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return Observable.of(request)
            .switchMap((req) => next.handle(req))
            .catch((errorResponse) => {
                const error = new SimpleError(errorResponse)
                this.timeHttpService.error$.next(error)
                if (error.status === HttpStatus.CLIENT_ERROR_unauthorized) {
                    this.timeHttpService.sessionInvalid$.next(error)
                }
                return Observable.throw(error)
            })
    }
}
