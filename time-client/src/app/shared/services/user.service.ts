import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'

import { ApiEndpoints } from '@time/common/constants/api-endpoints'
import { User } from '@time/common/models/api-models/user'
import { Login } from '@time/common/models/interfaces/api/login'
import { UserRegistration } from '@time/common/models/interfaces/api/user-registration'
import { TimeHttpService } from '@time/common/ng-modules/http'
import { AppRoutes } from '../../constants/app-routes'

@Injectable()
export class UserService {
    private _user: User
    private userSubject = new ReplaySubject<User>(1)
    public users: Observable<User>

    constructor (
        private http: HttpClient,
        private timeHttpService: TimeHttpService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.users = this.userSubject.asObservable()
        this.users.subscribe(user => {
            this._user = user
        })
        this.timeHttpService.sessionInvalids.subscribe(err => {
            this.clearSession()
        })
        this.getUser()
    }

    public get user() {
        return this._user
    }

    private clearSession() {
        this.userSubject.next(null)
    }

    private refreshSession(user: User) {
        this.userSubject.next(user)
    }

    public signup(userInfo: UserRegistration) {
        this.http.post(`${ApiEndpoints.User}/register`, userInfo)
            .subscribe((user: User) => {
                this.refreshSession(user)
            })
    }

    public login(credentials: Login) {
        this.http.post(`${ApiEndpoints.User}/login`, credentials)
            .subscribe((userData: User) => {
                this.refreshSession(userData)
            })
    }

    public getUser() {
        this.http.get(`${ApiEndpoints.User}/get-user`).subscribe((userData: User) => {
            this.refreshSession(userData)
        })
    }

    public logout() {
        this.http.post(`${ApiEndpoints.User}/logout`, {})
            .subscribe(successResponse => {
                this.clearSession()

                // If the route is protected, navigate away.

                this.router.navigateByUrl(AppRoutes.Shop)
            })
    }

    public verifyEmail(token: string) {
        return this.http.get<User>(`${ApiEndpoints.User}/verify-email/${token}`)
    }
}
