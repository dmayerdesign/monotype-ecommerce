import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'

import { IUser } from '../../models'
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
            .map((res: any) => {
                // Only capture responses, ignore requests
                if (res instanceof HttpResponse) {
                    console.log("From interceptor:", res)
                    if (res.body.authToken) {
                        this.timeHttpService.auth$.next(res.body.authToken)
                    }
                }

                return res
            })
            .catch((response) => {
                this.timeHttpService.error$.next(new SimpleError(response))
                return Observable.throw(new SimpleError(response))
            })
    }
}