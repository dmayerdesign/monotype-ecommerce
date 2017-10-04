import { Injectable } from '@angular/core'
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    Router,
    RouterStateSnapshot,
} from '@angular/router'
import { RouteStateService } from './route-state.service'
import { UiService } from './ui.service'
import { UserService } from './user.service'

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {

    constructor(
        private userService: UserService,
        private router: Router,
        private routeState: RouteStateService,
    ) {}

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.userService.user) {
            return true
        }
        else {
            const redirectTo = this.routeState.previousUrl || '/'
            this.router.navigate([redirectTo])
            // this.router.navigate(['/home/login'], { queryParams: { target: state.url }})
            return false
        }
    }

    public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state)
    }

}
