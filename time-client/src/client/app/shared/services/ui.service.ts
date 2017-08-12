import { Injectable, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { appConfig } from '../../../../../../time-common/config/app-config';

@Injectable()
export class UIService {
	public viewReady$: Subject<boolean> = new Subject<boolean>();
	public flash$: Subject<any> = new Subject<any>();

	public readyCriteria: string[] = [
		'app',
	];
	public ready: string[] = [];

	constructor(
		private titleService: Title,
	) {}

	declareReady(which: string) {
		console.log(which + " is ready");
		console.log(appConfig);
		if (this.ready.indexOf(which) === -1) {
			this.ready.push(which);

			if (this.readyCriteria.length && this.readyCriteria.every(criterion => { return (this.ready.indexOf(criterion) > -1) })) {
				console.log("All ready");
				this.viewReady$.next(true);
			}
		}
	}

	/**
	* Show a flash message
	*
	* @param msg
	* @param {string} [t = success|error|info|warning]
	*/
	flash(message: string, type: 'success'|'error'|'info'|'warning' = 'info', timeout: number = 5000) {
		let data = {
			type,
			message,
			timeout,
		}
		console.log(data);
		this.flash$.next(data);
	}
}