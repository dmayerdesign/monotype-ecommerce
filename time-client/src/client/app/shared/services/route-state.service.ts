import { Injectable } from '@angular/core'
import { ActivatedRoute, Event, NavigationEnd, NavigationStart, Router } from '@angular/router'
import { Observable, Subject } from 'rxjs/Rx'
import 'rxjs/add/operator/filter'
import { UiService } from './ui.service'
import { UserService } from './user.service'

@Injectable()
export class RouteStateService {

    public previousUrl: string

    constructor(
        private router: Router,
        private route: ActivatedRoute,
    ) {
        setTimeout(() => this.init())
    }

    public init() {
        this.router.events
            .subscribe(e => {
                if (e instanceof NavigationEnd) {
                    this.previousUrl = e.url
                    console.log(e)
                }
            })
    }
}
