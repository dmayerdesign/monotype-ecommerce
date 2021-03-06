import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { Cart } from '@mte/common/api/interfaces/cart'
import { Login } from '@mte/common/api/interfaces/login'
import { User } from '@mte/common/api/interfaces/user'
import { UserRegistration } from '@mte/common/api/interfaces/user-registration'
import { LocalStorageKeys } from '@mte/common/constants'
import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { MteHttpService } from '@mte/common/lib/ng-modules/http'
import { of as observableOf, Observable, ReplaySubject } from 'rxjs'
import { map } from 'rxjs/operators'
import { AppRoutes } from '../constants/app-routes'
import { UtilService } from './util.service'

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user: User
    private userSubject = new ReplaySubject<User>(1)
    public users: Observable<User>

    constructor (
        private http: HttpClient,
        private mteHttpService: MteHttpService,
        private router: Router,
        private utilService: UtilService
    ) {
        this.users = this.userSubject.asObservable()
        this.users.subscribe(user => {
            this._user = user
        })
        this.mteHttpService.sessionInvalids.subscribe(err => {
            this.clearSession()
        })
        this.fetchUser()
    }

    public get user(): User {
        return this._user
    }

    public fetchUser(): void {
        this.http.get(`${ApiEndpoints.User}`).subscribe((userData: User) => {
            this.refreshSession(userData)
        })
    }

    private clearSession(): void {
        this.userSubject.next(null)
    }

    private refreshSession(user: User): void {
        this.userSubject.next(user)
    }

    public signup(userInfo: UserRegistration): void {
        this.http.post(`${ApiEndpoints.User}/register`, userInfo)
            .subscribe((user: User) => {
                this.refreshSession(user)
            })
    }

    public login(credentials: Login): void {
        this.http.post(`${ApiEndpoints.User}/login`, credentials)
            .subscribe((userData: User) => {
                this.refreshSession(userData)
            })
    }

    public logout(): void {
        this.http.post(`${ApiEndpoints.User}/logout`, {})
            .subscribe(() => {
                this.clearSession()

                // If the route is protected, navigate away.
                this.router.navigateByUrl(AppRoutes.Shop)
            })
    }

    public updateCart(cart: Cart): Observable<Cart> {
        if (this.user) {
            return this.http.put<User>(`${ApiEndpoints.User}/update`, { cart })
                .pipe(map((user) => user.cart))
        } else {
            this.utilService.saveToLocalStorage(LocalStorageKeys.Cart, cart)
            return observableOf(cart)
        }
    }

    public verifyEmail(token: string): Observable<User> {
        return this.http.get<User>(`${ApiEndpoints.User}/verify-email/${token}`)
    }
}
