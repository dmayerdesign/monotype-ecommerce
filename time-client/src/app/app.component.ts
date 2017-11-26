import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { Copy } from '@time/common/constants'
import { ToastType } from '@time/common/models/enums/toast-type'
import { IModalData } from '@time/common/models/interfaces/ui/modal-data'
import { IToast } from '@time/common/models/interfaces/ui/toast'
import { UiService } from './shared/services/ui.service'
import { UtilService } from './shared/services/util.service'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    public toastSubject = new Subject<IToast>()
    public toast$: Observable<IToast>
    public modalDataSubject = new Subject<IModalData>()
    public modalData$: Observable<IModalData>

    constructor(
        private ui: UiService,
        private util: UtilService,
    ) { }

    public ngOnInit() {
        this.toast$ = this.toastSubject.asObservable()
        this.modalData$ = this.modalDataSubject.asObservable()

        this.ui.flash$.subscribe(flash => this.toastSubject.next(flash))

        this.ui.modal$.subscribe(modalData => this.modalDataSubject.next(modalData))
    }
}
