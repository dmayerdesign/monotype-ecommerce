import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'

import { User } from '@time/common/models/api-models/user'
import { ILogin } from '@time/common/models/interfaces/login'
import { IUserRegistration } from '@time/common/models/interfaces/user-registration'
import { TimeHttpService } from '@time/common/ng-modules/http'

@Injectable()
export class UserService {
    private _user: User
    public userSubject = new ReplaySubject<User>(1)
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

    private clearSession(): void {
        this.userSubject.next(null)
    }

    private refreshSession(user: User): void {
        this.userSubject.next(user)
    }

    public signup(userInfo: IUserRegistration): void {
        this.http.post('/api/user/register', userInfo)
            .subscribe((user: User) => {
                this.refreshSession(user)
            })
    }

    public login(credentials: ILogin): void {
        // FOR TESTING
        this.http.get('/api/user/login').subscribe((userData: User) => {
            this.refreshSession(userData)
        })
        // this.http.post('/api/user/login', credentials)
    }

    public getUser(): void {
        this.http.get('/api/user/get-user').subscribe((userData: User) => {
            this.refreshSession(userData)
        })
    }

    public logout(): void {
        this.http.post('/api/user/logout', {})
            .subscribe(successResponse => {
                this.clearSession()
                // If the route is protected, navigate away
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
        return this.http.get<User>(`/api/verify-email/${token}`)
    }
}
