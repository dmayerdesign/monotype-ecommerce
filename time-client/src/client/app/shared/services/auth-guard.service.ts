import { Injectable } from '@angular/core'
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { UserService } from './user.service'
import { UiService } from './ui.service'

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {

	constructor(
		private userService: UserService,
		private router: Router,
    private ui: UiService,
	) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.userService.isLoggedIn()) {
    	return true
    } else {
      this.router.navigate(['/home/login'], { queryParams: { target: state.url }})
    	return false
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state)
  }

}