import { Injectable, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { appConfig } from '../../../../../../time-common/config/app-config';

export const calendarColors: any = {
  blue: {
    primary: "#A19CB0",
    secondary: "#A19CB0",
  },
  orange: {
  	primary: appConfig.branding.colors.accent,
  	secondary: appConfig.branding.colors.accent,
  },
  red: {
    primary: "#E96363",
    secondary: "#F54343",
  },
};

class HomeSignupVO {
	private states = ['home', 'preForm', 'signupForm', 'form1', 'form2', 'postSignup'];

	home: Subject<boolean> = new Subject<boolean>();
	preForm: Subject<boolean> = new Subject<boolean>();
	signupForm: Subject<boolean> = new Subject<boolean>();
	form1: Subject<boolean> = new Subject<boolean>();
	form2: Subject<boolean> = new Subject<boolean>();
	postSignup: Subject<boolean> = new Subject<boolean>();

	constructor() {
		this.home.next(true);
	}

	private nextState(...args: string[]) {
		this.states.forEach(s => {
			if (args.indexOf(s) > -1) this[s].next(true);
			else this[s].next(false);
		});
	}
	goToHome() {
		this.nextState('home');
	}
	goToPreForm() {
		this.nextState('preForm');
	}
	goToForm1() {
		this.nextState('signupForm', 'form1');
	}
	goToForm2() {
		this.nextState('signupForm', 'form2');
	}
	goToPostSignup() {
		this.nextState('postSignup');
	}
}

@Injectable()
export class UIService {
	public viewReady$: Subject<boolean> = new Subject<boolean>();
	public flash$: Subject<any> = new Subject<any>();
	public homeSignup: HomeSignupVO = new HomeSignupVO();

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