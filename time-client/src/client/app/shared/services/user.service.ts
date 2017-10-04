import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { CONSTANTS } from '@time/common/constants'
import { IUser } from '@time/common/models/interfaces'
import { TimeHttpService } from '@time/common/ng-modules/http'
import { UtilService } from './util.service'

@Injectable()
export class UserService {
    private jwtToken: string
    public user: IUser
    public user$: Subject<IUser> = new Subject<IUser>()
    public notifications = { sessions: 0, conversations: 0 }
    public notifications$: Subject<{sessions: number; conversations: number}> = new Subject()

    constructor (
        private http: HttpClient,
        private timeHttpService: TimeHttpService,
        private util: UtilService,
    ) {
        this.timeHttpService.auth$.subscribe(token => {
            this.jwtToken = token
            let base64: string = token.split('.')[1]
            base64 = base64.replace('-', '+').replace('_', '/')
            this.user = JSON.parse(window.atob(base64))
            localStorage.setItem("authToken", this.jwtToken)
        })

        this.timeHttpService.error$.subscribe(err => {
            if (err.status === CONSTANTS.HTTP.CLIENT_ERROR_forbidden || err.status === CONSTANTS.HTTP.CLIENT_ERROR_unauthorized) {
                if (this.user) {
                    this.doLogout()
                    window.location.reload()
                }
            }
        })
    }

    public get token(): string {
        return this.jwtToken || <string>this.util.getFromLocalStorage("authToken")
    }

    private doLogout(): void {

    }

    public signup(user): Observable<any> {
        return this.http.post('/api/user/register', user)
    }

    public login(credentials: {email: string; password: string}): void {
        // FOR TESTING
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
