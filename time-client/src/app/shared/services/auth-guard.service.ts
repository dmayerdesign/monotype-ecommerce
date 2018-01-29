import { Injectable } from '@angular/core'
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    Router,
    RouterStateSnapshot,
} from '@angular/router'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/take'

import { AppRoutes } from '../../constants/app-routes'
import { RouteStateService } from './route-state.service'
import { UserService } from './user.service'

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {

    constructor(
        private userService: UserService,
        private router: Router,
        private routeState: RouteStateService,
    ) {}

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.userService.users
            .map(user => {
                if (user) {
                    return true
                }
                else {
                    const redirectTo = this.routeState.previousUrl || AppRoutes.Login
                    this.router.navigate([redirectTo])
                    return false
                }
            })
    }

    public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.canActivate(route, state)
    }

}
