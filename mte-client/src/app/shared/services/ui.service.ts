import { Injectable } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { InjectionTokens } from '@mte/common/constants/angular/injection-tokens'
import { Copy } from '@mte/common/constants/copy'
import { HttpStatus } from '@mte/common/constants/http-status'
import { MteHttpService, SimpleError } from '@mte/common/lib/ng-modules/http'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import { ToastType } from '@mte/common/models/enums/toast-type'
import { ModalData } from '@mte/common/models/interfaces/ui/modal-data'
import { Toast } from '@mte/common/models/interfaces/ui/toast'
import { OrganizationService } from './organization.service'

@Injectable()
export class UiService {
    public loadings = new BehaviorSubject<boolean>(true)
    public flashes = new Subject<Toast>()
    public modals = new Subject<ModalData>()

    constructor(
        private titleService: Title,
        private mteHttpService: MteHttpService,
        private windowRef: WindowRefService,
        private organizationService: OrganizationService
    ) {
        this.mteHttpService.errors.subscribe((error) => {
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
    public setTitle(title: string): void {
        if (!!this.organizationService.getName()) {
            this.titleService.setTitle(`${title} | ${this.organizationService.getName()}`)
        }
        else {
            this.titleService.setTitle(title)
        }
    }

    /**
     * Get the document title.
     *
     * @returns {string}
     * @memberof UiService
     */
    public getTitle(): string {
        return this.titleService.getTitle()
    }

	/**
     * Display a flash message.
     *
     * @param {string} message
     * @param {ToastType} [type=ToastType.Info]
     * @param {number} timeout=5500]
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
        this.flash(error.message || Copy.ErrorMessages.serverError, ToastType.Error)
    }

    /**
	 * Display a warning as a flash message.
     *
     * @param {SimpleError} error
     * @memberof UiService
     */
    public flashWarning(error: SimpleError) {
        this.flash(error.message || Copy.ErrorMessages.serverWarning, ToastType.Warning)
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
