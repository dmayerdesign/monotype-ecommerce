import { Injectable } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'

import { ErrorMessage } from '@time/common/constants/error-message'
import { HttpStatus } from '@time/common/constants/http-status'
import { ToastType } from '@time/common/models/enums/toast-type'
import { ModalData } from '@time/common/models/interfaces/ui/modal-data'
import { Toast } from '@time/common/models/interfaces/ui/toast'
import { SimpleError, TimeHttpService } from '@time/common/ng-modules/http'

@Injectable()
export class UiService {
    public loadings = new BehaviorSubject<boolean>(true)
    public flashes = new Subject<Toast>()
    public modals = new Subject<ModalData>()

    constructor(
        private titleService: Title,
        private timeHttpService: TimeHttpService,
    ) {
        this.timeHttpService.errors.subscribe((error) => {
            const isClientError = Object.keys(HttpStatus)
                    .filter((httpStatusKey) => HttpStatus[httpStatusKey] >= 400 && HttpStatus[httpStatusKey] < 500)
                    .some((httpStatusKey) => error.status === HttpStatus[httpStatusKey])

            if (isClientError) {
                this.flashWarning(error)
            }
            else {
                this.flashError(error)
            }
        })
    }

    /**
     * Set the document title.
     *
     * @param {string} title
     * @memberof UiService
     */
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
        const data: Toast = {
            type,
            message,
            timeout,
        }
        this.flashes.next(data)
    }

    /**
	 * Display an error as a flash message.
     *
     * @param {SimpleError} error
     * @memberof UiService
     */
    public flashError(error: SimpleError) {
        this.flash(error.message || ErrorMessage.ServerError, ToastType.Error)
    }

    /**
	 * Display a warning as a flash message.
     *
     * @param {SimpleError} error
     * @memberof UiService
     */
    public flashWarning(error: SimpleError) {
        this.flash(error.message || ErrorMessage.ServerWarning, ToastType.Warning)
    }

    /**
     * Display a modal.
     *
     * @param {ModalData} data
     * @memberof UiService
     */
    public showModal(data: ModalData) {
        this.modals.next(data)
    }
}
