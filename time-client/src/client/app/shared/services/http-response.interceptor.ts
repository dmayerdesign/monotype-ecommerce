import { Observable, Subject } from 'rxjs/Rx'
// import { Subject } from 'rxjs/Subject'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/publish'
import 'rxjs/add/operator/publishLast'
// import 'rxjs/add/operator/refCount'

import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpSentEvent,
} from '@angular/common/http'
import { Injectable } from '@angular/core'
import { SimpleError, TimeHttpResponse } from '@time/common/http'
import { IUser } from '@time/common/models'

import { setInterval } from 'timers'
import { UtilService } from './util.service'

@Injectable()
export class HttpResponseInterceptor implements HttpInterceptor {

    public error$: Observable<SimpleError>
    public userSession$: Observable<IUser|false>
    private errorSubject = new Subject<SimpleError>()
    public userSessionSubject = new Subject<IUser|false>()

    constructor(
        private util: UtilService,
    ) {
        this.error$ = this.errorSubject.asObservable()
        this.userSession$ = this.userSessionSubject.asObservable()
    }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return Observable.of(request)
            .switchMap((req) => next.handle(req))
            .do((data: any/*TimeHttpResponse*/) => {
                // Only capture responses, ignore requests
                if (data instanceof HttpResponse) {
                    console.log("Intercepted")
                    if (data.body.user) {
                        this.userSessionSubject.next(data.body.user)
                    } else {
                        this.userSessionSubject.next(false)
                    }
                }
            })
            .catch((response) => {
                if (response instanceof HttpErrorResponse) {
                    this.errorSubject.next(new SimpleError(response))
                } else {
                    this.errorSubject.next(response)
                }
                this.util.userError$.next("Works!")
                return Observable.throw(new SimpleError(response))
            })
                // .switchMap(res => next.handle(res))
                // .do(data => console.log("Response?", data))
                // .catch(err => {
                //     console.log("Error?", err)
                //     return Observable.throw(err)
                // })
        // return handle.switchMap(req => next.handle(req))






            // .do((ev: HttpEvent<TimeHttpResponse>) => {
            //     if (ev instanceof HttpResponse) {
            //         if (ev.body && !ev.body.user) {
            //             this.userSubject.next(false)
            //         } else {
            //             this.userSubject.next(ev.body.user)
            //         }
            //         this.testSubject.next("works!")
            //     }
            //     if (ev instanceof HttpErrorResponse) {
            //         console.log("Error caught")
            //         this.util.userError$.next("Works")
            //     }
            //     console.log("Something")
            // })
            // .catch((response) => {
            //     setTimeout(() => {
            //         if (response instanceof HttpErrorResponse) {
            //             console.log("Error passed to errorSubject")
            //             this.errorSubject.next(new SimpleError(response))
            //         }
            //     }, 500)
            //     this.errorSubject.next(new SimpleError(response))
            //     this.util.userError$.next("Works")
            //     console.log("Error went through interceptor", response)
            //     return Observable.throw(new SimpleError(response))
            // })
    }
}
