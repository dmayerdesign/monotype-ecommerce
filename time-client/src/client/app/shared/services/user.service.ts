import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { HttpStatus } from '@time/common/constants'
import { IUser } from '@time/common/models/interfaces'
import { TimeHttpService } from '@time/common/ng-modules/http'
import { UtilService } from './util.service'

@Injectable()
export class UserService {
    private jwtToken: string
    private _user: IUser
    public user$: Subject<IUser> = new Subject<IUser>()
    public notifications = { sessions: 0, conversations: 0 }
    public notifications$: Subject<{sessions: number; conversations: number}> = new Subject()

    constructor (
        private http: HttpClient,
        private timeHttpService: TimeHttpService,
        private util: UtilService,
    ) {
        this.timeHttpService.sessionInvalid$.subscribe(err => {
            if (this.user) {
                this.doLogout()
            }
        })
    }

    public get user(): IUser {
        return this._user
    }

    private doLogout(): void {
        console.log("Doing logout")
    }

    public signup(user): Observable<any> {
        return this.http.post('/api/user/register', user)
    }

    public login(credentials: {email: string; password: string}): void {
        // FOR TESTING
        console.log("Do login")
        this.http.get('/api/user/login').subscribe(data => console.log(data))
        // this.http.post('/api/user/login', credentials)
    }

    public logout(): Observable<any> {
        return this.http.post('/api/user/logout', {})
    }

    public verifyEmail(token: string): Observable<IUser> {
        return this.http.get<IUser>(`/api/verify-email/${token}`)
    }
}
