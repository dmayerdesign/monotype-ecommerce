import { HttpClient } from '@angular/common/http'
import { EventEmitter, Inject, Injectable } from '@angular/core'
import { CanActivate, CanActivateChild, Router } from '@angular/router'
import { Observable, Subject } from 'rxjs/Rx'

import { IUser } from '@time/common/models/interfaces'
import { UtilService } from './util.service'

@Injectable()
export class UserService {
    public user: IUser
    public user$: Subject<IUser> = new Subject<IUser>()
    public notifications = { sessions: 0, conversations: 0 }
    public notifications$: Subject<{sessions: number; conversations: number}> = new Subject()

    constructor (
        private http: HttpClient,
        private router: Router,
        private util: UtilService,
    ) {}

    public signup(user): Observable<any> {
        return this.http.post('/api/signup', user)
    }

    public login(credentials: {email: string; password: string}): Observable<any> {
        return this.http.post('/api/login/local', credentials)
    }

    public logout(): Observable<any> {
        return this.http.post('/api/logout', {})
    }

    public verifyEmail(token: string): Observable<IUser> {
        return this.http.get<IUser>(`/api/verify-email/${token}`)
    }

    // edit(user: any, done?: (err?: any, user?: IUser) => void) {
    //     this.http.post('/api/user/edit', user)
    //         .map((res: Response) => res.json())
    //         .catch(this.util.catchHttpError)
    //         .subscribe(
    //             user => {
    //                 this.onLogin(user)
    //                 if (done) done(null, user)
    //             },
    //             err => {
    //                 if (err) done(err)
    //                 this.util.handleError(err)
    //             },
    //         )
    // }

    // editPassword(newPassword: string, resetToken?: string, done?: (err?: any, user?: IUser) => void) {
    //     this.http.post('/api/reset-password', {newPassword, resetToken})
    //         .map((res: Response) => res.json())
    //         .catch(this.util.catchHttpError)
    //         .subscribe(
    //             user => {
    //                 this.onLogin(user)
    //                 if (done) done(null, user)
    //             },
    //             err => {
    //                 if (err) done(err)
    //                 this.util.handleError("Password update failed")
    //             },
    //         )
    // }

    // forgotPassword(email: string): Observable<IUser> {
    //     return this.http.post('/api/send-forgot-password', {email})
    //         .map((res: Response) => res.json())
    //         .catch(this.util.catchHttpError)
    // }
}
