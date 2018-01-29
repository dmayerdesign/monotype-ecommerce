import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'

import { HttpStatus } from '../../constants'
import { HttpInjectionTokens } from './http.injection-tokens'
import { IHttpSettings, SimpleError } from './http.models'
import { TimeHttpService } from './http.service'

@Injectable()
export class TimeHttpResponseInterceptor implements HttpInterceptor {

    constructor(
        private timeHttpService: TimeHttpService,
        @Inject(HttpInjectionTokens.HttpSettings) private httpSettings: typeof IHttpSettings,
    ) {}

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const isBlacklistedFromErrorFlash = (): boolean => {
            return this.httpSettings &&
                this.httpSettings.httpFlashErrorBlacklist &&
                this.httpSettings.httpFlashErrorBlacklist.some((x) => {
                    return request.method.toLowerCase() === x.method.toLowerCase() &&
                        !!request.url.match(new RegExp(x.endpoint))
                })
        }

        return Observable.of(request)
            .switchMap((req) => next.handle(req))
            .catch((errorResponse) => {
                // console.log('[TimeHttpResponseInterceptor#intercept] Error response', errorResponse)
                const error = new SimpleError(errorResponse)

                // If the error is a 401, pipe it through the `sessionInvalids` stream.

                if (error.status === HttpStatus.CLIENT_ERROR_unauthorized) {
                    this.timeHttpService.sessionInvalids.next(error)
                }

                // Else, if the error is coming from a blacklisted endpoint, pipe it through the generic `errors` stream.

                else if (!isBlacklistedFromErrorFlash()) {
                    this.timeHttpService.errors.next(error)
                }

                return Observable.throw(error)
            })
    }
}
