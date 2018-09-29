import { Component, Injector, OnInit } from '@angular/core'
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router'
import { Organization } from '@mte/common/api/interfaces/organization'
import { filter } from 'rxjs/operators'
import { OrganizationService } from './services/organization.service'
import { UiService } from './services/ui.service'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    public organization: Organization
    public ready = false

    public router: Router
    public activatedRoute: ActivatedRoute

    constructor(
        public injector: Injector,
        public uiService: UiService,
        public organizationService: OrganizationService,
    ) {
        this.organizationService.organizations.subscribe((org) => {
            this.organization = org
            this.checkIfReady()
        })
    }

    public getRouteData(): any {
        let data: any
        const crawl = (snapshot: ActivatedRouteSnapshot): any => {
            if (!snapshot) {
                return
            }
            if (!!snapshot.data && !!snapshot.data.title) {
                data = snapshot.data
            }
            crawl(snapshot.firstChild)
        }
        crawl(this.activatedRoute.snapshot)
        return data
    }

    public ngOnInit(): void {
        this.router = this.injector.get(Router)
        this.activatedRoute = this.injector.get(ActivatedRoute)
        const routeSnapshot = this.activatedRoute.snapshot

        this.router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            filter(() => !!this.getRouteData()),
        )
        .subscribe(() => this.uiService.setTitle(this.getRouteData().title))
    }

    public getBackgroundStyle() {
        if (this.organization.globalStyles.backgroundPatternImageSrc) {
            return {
                backgroundRepeat: 'repeat',
                backgroundImage: `url(${this.organization.globalStyles.backgroundPatternImageSrc})`
            }
        }
    }

    private checkIfReady(): void {
        const readyConditions: boolean[] = [
            !!this.organization
        ]

        this.ready = readyConditions.every((condition) => condition === true)
    }
}
