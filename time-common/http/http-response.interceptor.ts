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
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/do'
import { IUser } from '../models/interfaces'
import { SimpleError } from './http.models'
import { TimeHttpResponse } from './http.models'

@Injectable()
export class TimeHttpResponseInterceptor implements HttpInterceptor {

    public user$: Observable<IUser|false>
    public error$: Observable<SimpleError>
    public test$: Observable<any>

    private userSubject = new Subject<IUser|false>()
    private errorSubject = new Subject<SimpleError>()
    private testSubject = new Subject<any>()

    constructor() {
        this.user$ = this.userSubject.asObservable()
        this.error$ = this.errorSubject.asObservable()
        this.test$ = this.testSubject.asObservable()
    }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next
            .handle(request)
            .do((ev: HttpEvent<TimeHttpResponse>) => {
                if (ev instanceof HttpResponse) {
                    if (ev.body && !ev.body.user) {
                        this.userSubject.next(false)
                    } else {
                        this.userSubject.next(ev.body.user)
                    }
                    this.testSubject.next("works!")
                }
            })
            .catch((response) => {
                if (response instanceof HttpErrorResponse) {
                    console.log('Processing http error')
                    this.errorSubject.next(new SimpleError(response))
                }
                return Observable.throw(new SimpleError(response))
            })
    }
}
