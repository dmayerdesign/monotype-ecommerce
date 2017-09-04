import { Injectable, EventEmitter, ChangeDetectorRef } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Observable, Subject } from 'rxjs'
import { appConfig } from '@time/app-config'
import { SimpleError } from '@time/common/http'

export type FlashMessageType = 'success'|'error'|'info'|'warn'
export interface IFlash {
	type: string
	message: string
	timeout?: number
}

@Injectable()
export class UiService {
	public viewReady$ = new Subject<boolean>()
	public flash$ = new Subject<IFlash>()

	constructor(
		private titleService: Title,
	) {}

	setTitle(title: string) {
		this.titleService.setTitle(title)
	}

	/**
	 * Show a flash message
	 *
	 * @param msg
	 * @param {string} [t = success|error|info|warning]
	 */
	flash(message: string, type: FlashMessageType = 'info', timeout: number = 5000) {
		let data: IFlash = {
			type,
			message,
			timeout,
		}
		this.flash$.next(data)
	}

	/**
	 * Display an error as a flash message
	 */
	flashError(error: SimpleError) {
		this.flash(error.message, 'error')
	}
}