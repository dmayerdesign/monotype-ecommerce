import { Injectable } from '@angular/core'
import { ActivatedRoute, NavigationStart, Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/switchMap'

@Injectable()
export class RouteStateService {

    public previousUrl = "/"
    public routerEvents$: Observable<any>

    constructor(
        private router: Router,
        private route: ActivatedRoute,
    ) {
        setTimeout(() => this.init())
    }

    public init() {
        Observable.of(null)
            .switchMap(x => this.router.events)
            .filter(e => e instanceof NavigationStart)
            .subscribe(e => {
                if (this.route.snapshot.firstChild
                    && this.route.snapshot.firstChild.url
                    && this.route.snapshot.firstChild.url.length) {
                    this.previousUrl = this.route.snapshot.firstChild.url.map(segment => "/" + segment.path).join("")
                } else {
                    this.previousUrl = "/"
                }
            })
    }

    public refreshPage() {
        window.location.reload()
    }
}
