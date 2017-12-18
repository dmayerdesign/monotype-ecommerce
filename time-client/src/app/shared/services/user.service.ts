import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'

import { Endpoints } from '@time/common/constants/endpoints'
import { User } from '@time/common/models/api-models/user'
import { ILogin } from '@time/common/models/interfaces/login'
import { IUserRegistration } from '@time/common/models/interfaces/user-registration'
import { TimeHttpService } from '@time/common/ng-modules/http'

@Injectable()
export class UserService {
    private _user: User
    private userSubject = new ReplaySubject<User>(1)
    public user$: Observable<User>

    constructor (
        private http: HttpClient,
        private timeHttpService: TimeHttpService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.user$ = this.userSubject.asObservable()
        this.user$.subscribe(user => {
            this._user = user
        })
        this.timeHttpService.sessionInvalid$.subscribe(err => {
            if (this.user) {
                this.clearSession()
            }
        })
        this.getUser()
    }

    public get user(): User {
        return this._user
    }

    private clearSession() {
        this.userSubject.next(null)
    }

    private refreshSession(user: User) {
        console.log('Refresh session:')
        console.log(user)
        this.userSubject.next(user)
    }

    public signup(userInfo: IUserRegistration) {
        this.http.post(`${Endpoints.User}/register`, userInfo)
            .subscribe((user: User) => {
                this.refreshSession(user)
            })
    }

    public login(credentials: ILogin) {
        this.http.post(`${Endpoints.User}/login`, credentials)
            .subscribe((userData: User) => {
                this.refreshSession(userData)
            })
    }

    public getUser() {
        this.http.get(`${Endpoints.User}/get-user`).subscribe((userData: User) => {
            this.refreshSession(userData)
        })
    }

    public logout() {
        this.http.post(`${Endpoints.User}/logout`, {})
            .subscribe(successResponse => {
                this.clearSession()

                // If the route is protected, navigate away.

                if (this.route.routeConfig.canActivate
                    || (this.route.firstChild
                        && (this.route.firstChild.routeConfig.canActivate
                            || this.route.firstChild.routeConfig.canActivateChild))
                    || (this.route.firstChild.children[0]
                        && (this.route.firstChild.children[0].routeConfig.canActivate
                            || this.route.firstChild.children[0].routeConfig.canActivateChild))
                ) {
                    this.router.navigateByUrl('/shop')
                }
            })
    }

    public verifyEmail(token: string): Observable<User> {
        return this.http.get<User>(`${Endpoints.User}/verify-email/${token}`)
    }
}
