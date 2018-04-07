import { Injectable } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { filter } from 'rxjs/operators'

@Injectable()
export class RouteStateService {

    public previousUrl: string

    constructor(
        private router: Router,
    ) {
        this.previousUrl = this.router.url
        setTimeout(() => this.init())
    }

    public init() {
        this.router.events
            .pipe(filter((e) => e instanceof NavigationStart))
            .subscribe((e) => {
                this.previousUrl = this.router.url
            })
    }

    public refreshPage() {
        window.location.reload()
    }
}
