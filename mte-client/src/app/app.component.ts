import { Component } from '@angular/core'

import { Organization } from '@mte/common/models/api-models/organization'
import { OrganizationService } from './shared/services'
import { UiService } from './shared/services/ui.service'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    public organization: Organization
    public ready = false

    constructor(
        public ui: UiService,
        public organizationService: OrganizationService
    ) {
        this.organizationService.organizations.subscribe((org) => {
            this.organization = org
            this.checkIfReady()
        })
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
        if (!!this.organization) {
            this.ready = true
        }
    }
}
