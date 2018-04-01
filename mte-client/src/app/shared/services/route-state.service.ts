import { Injectable } from '@angular/core'
import { ActivatedRoute, NavigationStart, Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { filter } from 'rxjs/operators'

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
            .pipe(filter(e => e instanceof NavigationStart))
            .subscribe(e => {
                if (this.route.snapshot.firstChild
                    && this.route.snapshot.firstChild.url
                    && this.route.snapshot.firstChild.url.length) {
                    this.previousUrl = this.route.snapshot.firstChild.url.map(segment => '/' + segment.path).join('')
                } else {
                    this.previousUrl = '/'
                }

                console.log(this.previousUrl)
            })
    }

    public refreshPage() {
        window.location.reload()
    }
}
