import { Injectable } from '@angular/core'
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { UserService } from './user.service'
import { UIService } from './ui.service'

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {

	constructor(
		private userService: UserService,
		private router: Router,
    private ui: UIService,
	) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
  	// console.log("can activate", this.userService.isLoggedIn())
    if (this.userService.isLoggedIn()) {
    	return true
    } else {
      // if (state.url && state.url !== '/' && state.url.indexOf("login") === -1 && state.url.indexOf("home") === -1) {
      //   this.router.navigate(['/home/login'], { queryParams: { target: state.url }})
      // } else {
      //   this.router.navigate(['/home'])
      // }
      // this.ui.flash("Your login session has ended", "info")
      
      this.router.navigate(['/home/login'], { queryParams: { target: state.url }})
    	return false
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state)
  }

}