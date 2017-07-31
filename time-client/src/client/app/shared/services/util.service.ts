import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { UIService } from './ui.service';

class ExpressResponse extends Response {
	_body: string;
}

@Injectable()
export class UtilService {

	private dateMidnightMillis: number;

	constructor(
		private titleService: Title,
		private ui: UIService,
	) {}

	setTitle(title: string): void {
		this.titleService.setTitle(title + ' | A2EE');
	}

	handleError(serverMsg: any, msg?: string): boolean {
		if (typeof serverMsg === "string") {
			if (serverMsg.charAt(0) === "{") serverMsg = JSON.parse(serverMsg).error;
		}
		console.error(serverMsg);
		if (this.ui && this.ui.flash) {
			this.ui.flash(msg || serverMsg || "Oops! Something went wrong. Please try again.", "error");
		}
		if (serverMsg) return true;
		else return false;
	}

	catchHttpError(error: ExpressResponse): Observable<any> {
		let err: any = error;
		console.error("Server Error:", error);

		if (error && typeof error._body === "string" && error._body.charAt(0) === "{") {
			err = JSON.parse((<any>error)._body);
			if (err) err = err.error;
		}

		return Observable.throw(err);
	}

	getFromLocalStorage(key: string): any {
		let item = localStorage.getItem(key);
		if (item && item.length) {
			if (item.charAt(0) === '[' || item.charAt(0) === '{') {
				return JSON.parse(item);
			}
			else {
				return item;
			}
		}
		return null;
	}

	gToOz(pK: number): number {
	    let nearExact = pK/453.59237;
	    let lbs = Math.floor(nearExact);
	    let oz = (nearExact - lbs) * 16;
	    return oz;
	}

	ozToG(pK: number): number {
		return pK * 28.3495;
	}

	getTimes(noAmPm?: boolean): Array<{name: string; value: number}> {
		let options = [];
		let loop = (amPm: 'am'|'pm') => {
		  for (let i = 0; i < 48; i++) { // 15 minute increments
		    let fractionStr = (i/4).toFixed(2).toString();
		    let timeStr: string;
		    let timeStrBefore: string;
		    let timeStrAfter: string;
		    let halfDay: number = amPm === 'pm' ? 3600000 * 12 : 0;
		    if (i < 4) {
		      timeStrBefore = "12";
		    }
		    else {
		      timeStrBefore = Math.floor(i/4).toFixed().toString();
		    }

		    timeStrAfter = (function() {
		      let decimals = fractionStr.substring(fractionStr.length - 2);
		      return (decimals === '00') ? '00' : (decimals === '25') ? '15' : (decimals === '50') ? '30' : (decimals === '75') ? '45' : '00';
		    }());

		    timeStr = noAmPm ? timeStrBefore + ":" + timeStrAfter : timeStrBefore + ":" + timeStrAfter + " " + amPm;
		    options.push({
		      name: timeStr,
		      value: (i * 900000) + halfDay,
		    });
		  }
		};
		loop('am');
		loop('pm');
		return options;
	}

	getTimesMap(): any {
		let times = this.getTimes();
		let map = {};
		times.forEach(time => {
			map[time.value] = time.name;
		});
		return map;
	}
}
