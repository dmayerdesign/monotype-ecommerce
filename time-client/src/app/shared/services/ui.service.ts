import { Injectable } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'

import { ErrorMessage } from '@time/common/constants/error-message'
import { ToastType } from '@time/common/models/enums/toast-type'
import { IModalData } from '@time/common/models/interfaces'
import { IToast } from '@time/common/models/interfaces/ui/toast'
import { SimpleError, TimeHttpService } from '@time/common/ng-modules/http'

@Injectable()
export class UiService {
    public loading$ = new BehaviorSubject<boolean>(true)
    public flash$ = new Subject<IToast>()
    public modal$ = new Subject<IModalData>()

    constructor(
        private titleService: Title,
        private timeHttpService: TimeHttpService,
    ) {
        this.timeHttpService.error$.subscribe(error => {
            this.flashError(error)
        })
    }

    public setTitle(title: string) {
        this.titleService.setTitle(title)
    }

	/**
     * Display a flash message.
     *
     * @param {string} message
     * @param {ToastType} [type=ToastType.Info]
     * @param {number} [timeout=5500]
     * @memberof UiService
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
	 * Display an error as a flash message.
	 */
    public flashError(error: SimpleError) {
        this.flash(error.message || ErrorMessage.ServerError, ToastType.Error)
    }

    /**
     * Display a modal
     */
    public showModal(data: IModalData) {
        this.modal$.next(data)
    }
}
