import { Component, OnInit } from '@angular/core'
import { ToastrService } from 'ngx-toastr'

import { Copy } from '@time/common/constants'
import { IFlash } from './shared/models/ui.models'
import { RouteStateService } from './shared/services/route-state.service'
import { UiService } from './shared/services/ui.service'
import { UtilService } from './shared/services/util.service'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    public title = 'app'
    public modal = {
        show: false,
        data: null,
    }

    constructor(
        private ui: UiService,
        private util: UtilService,
        private toastr: ToastrService,
        private routeState: RouteStateService,
    ) {}

    public ngOnInit() {
        this.ui.flash$.subscribe(flash => this.showToast(flash))
        this.util.serverError$.subscribe(err => {
            this.ui.flash(Copy.ErrorMessages.generic, "error")
        })
        this.ui.modal$.subscribe(modalData => {
            this.modal.data = modalData
            this.modal.show = true
        })
    }

    public showToast(flash: IFlash) {
        // If running on the server, don't attempt DOM manipulation
        if (!document) return
        // Need to wrap in a `setTimeout` to avoid `ExpressionChangedAfterItHasBeenCheckedError`
        setTimeout(() => this.toastr[flash.type](flash.message))
    }
}
