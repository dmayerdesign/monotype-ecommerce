import { Component, Injector, OnInit } from '@angular/core'
import { AppComponent } from './app.component'
import { OrganizationService } from './shared/services/organization.service'
import { UiService } from './shared/services/ui.service'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppServerComponent extends AppComponent implements OnInit {
    constructor(
        public injector: Injector,
        public ui: UiService,
        public organizationService: OrganizationService
    ) {
        super(
            injector,
            ui,
            organizationService
        )
    }

    public ngOnInit(): void { }
}
