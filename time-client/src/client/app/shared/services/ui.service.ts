import { Injectable } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Subject } from 'rxjs/Subject'

import { SimpleError, TimeHttpResponseInterceptor, TimeHttpService } from '@time/common/ng-modules/http'
import { FlashMessageType, IFlash } from '../models/ui.models'

@Injectable()
export class UiService {
    public viewReady$ = new Subject<boolean>()
    public flash$ = new Subject<IFlash>()
    public flashCancel$ = new Subject<any>()

    constructor(
        private titleService: Title,
        private timeHttpService: TimeHttpService,
    ) {
        this.timeHttpService.error$.subscribe(err => {
            console.log("ERROR!!@#!@!@#!@#", err)
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
    public flash(message: string, type: FlashMessageType = 'info', timeout: number = 5000) {
        const data: IFlash = {
            type,
            message,
            timeout,
        }
        this.flash$.next(data)
        setTimeout(() => {
            this.flashCancel$.next()
        }, timeout)
    }

	/**
	 * Display an error as a flash message
	 */
    public flashError(error: SimpleError) {
        this.flash(error.message, 'error')
    }
}
