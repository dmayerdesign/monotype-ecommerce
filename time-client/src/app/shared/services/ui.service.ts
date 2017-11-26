import { Injectable } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Subject } from 'rxjs/Subject'

import { ErrorMessage } from '@time/common/constants/error-message'
import { ToastType } from '@time/common/models/enums/toast-type'
import { IModalData } from '@time/common/models/interfaces'
import { IToast } from '@time/common/models/interfaces/ui/toast'
import { SimpleError, TimeHttpService } from '@time/common/ng-modules/http'

@Injectable()
export class UiService {
    public viewReady$ = new Subject<boolean>()
    public flash$ = new Subject<IToast>()
    public modal$ = new Subject<IModalData>()

    constructor(
        private titleService: Title,
        private timeHttpService: TimeHttpService,
    ) {
        this.timeHttpService.error$.subscribe(error => {
            console.log("ERROR!!!@!@#!@#")
            this.flashError(error)
        })
    }

    public setTitle(title: string) {
        this.titleService.setTitle(title)
    }

	/**
	 * Show a flash message
	 *
	 * @param msg
	 * @param {string} [t = success|error|info|warning]
	 */
    public flash(message: string, type: ToastType = ToastType.Info, timeout: number = 5500) {
        const data: IToast = {
            type,
            message,
            timeout,
        }
        this.flash$.next(data)
    }

	/**
	 * Display an error as a flash message
	 */
    public flashError(error: SimpleError) {
        console.error(error)
        this.flash(ErrorMessage.ServerError, ToastType.Error)
    }

    /**
     * Display a modal
     */
    public showModal(data: IModalData) {
        this.modal$.next(data)
    }
}
