import { Component } from '@angular/core'

import { UiService } from './shared/services/ui.service'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(
        public ui: UiService,
    ) { }
}
