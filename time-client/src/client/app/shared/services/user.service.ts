import { Injectable, Inject, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, CanActivateChild } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { IUser } from '../interfaces/user';
import { UtilService } from './util.service';

@Injectable()
export class UserService {
	
	private isUserLoggedIn: boolean = false;
	public user: IUser;
	public user$: Subject<IUser> = new Subject<IUser>();
	public sessionInvalid$: Subject<boolean> = new Subject<boolean>();
	public notifications = { sessions: 0, conversations: 0 };
	public notifications$: Subject<{sessions: number; conversations: number}> = new Subject();

	constructor (
		private http: Http,
		private router: Router,
		private util: UtilService,
	) {}

	private handleError(error: Response) {
		return Observable.throw(error || "Server Error");
	}

	signup(user): Observable<any> {
		return this.http.post('/api/v1/signup', user) // , <RequestOptionsArgs>{headers: headers, withCredentials: true})
			.map((res: Response) => res.json())
			.catch(this.util.catchHttpError);
	}

	login(credentials: {email: string; password: string}): Observable<any> {
		return this.http.post('/api/v1/login/local', credentials)
			.map((res: Response) => res.json())
			.catch(this.util.catchHttpError);
	}

	logout(): Observable<any> {
		console.log("Logging out");
		this.onLogout();
		return this.http.post('/api/v1/logout', {});
	}

	verifyEmail(token: string): Observable<IUser> {
		return this.http.get(`/api/v1/verify-email/${token}`)
			.map((res: Response) => res.json())
			.catch(this.util.catchHttpError);
	}

	getOne(id: string): Observable<any> {
		return this.http.get('/api/v1/user/' + id)
			.map((res: Response) => res.json())
			.catch(this.util.catchHttpError);
	}

	getCurrent(): Observable<any> {
		return this.http.get('/api/v1/current-user')
			.map((res: Response) => res.json());
	}

	cleanUser(user) {
		return user;
	}

	broadcast() {
		this.getCurrent().subscribe(
			user => {
				this.onLogin(user);
			},
			err => {
				this.sessionInvalid$.next(true);
				this.onLogout();
			},
		);
	}

	isLoggedIn(): boolean {
		return this.isUserLoggedIn;
	}

	onLogin(user: IUser): void {
		user = this.cleanUser(user);
		this.user = user;
		this.isUserLoggedIn = true;
		this.user$.next(user);
	}

	onLogout(): void {
		this.user = null;
		this.isUserLoggedIn = false;
	}

	getNotifications(): void {
		this.http.get('/api/v1/notifications')
			.map((res: Response) => res.json())
			.catch(this.util.catchHttpError)
			.subscribe(
				notifications => {
					this.notifications = notifications;
					this.notifications$.next(notifications);
				},
				err => this.util.catchHttpError(err),
			);
	}

	updateNotifications(notifications?: any): void {
		let sessions = notifications.sessions || this.notifications.sessions;
		let conversations = notifications.conversations || this.notifications.conversations;
		this.notifications = {sessions, conversations};
		this.notifications$.next({sessions, conversations});
	}

	edit(user: any, done?: (err?: any, user?: IUser) => void) {
		this.http.post('/api/v1/user/edit', user)
			.map((res: Response) => res.json())
			.catch(this.util.catchHttpError)
			.subscribe(
				user => {
					this.onLogin(user);
					if (done) done(null, user);
				},
				err => {
					if (err) done(err);
					this.util.handleError(err);
				},
			);
	}

	editPassword(newPassword: string, resetToken?: string, done?: (err?: any, user?: IUser) => void) {
		this.http.post('/api/v1/reset-password', {newPassword, resetToken})
			.map((res: Response) => res.json())
			.catch(this.util.catchHttpError)
			.subscribe(
				user => {
					this.onLogin(user);
					if (done) done(null, user);
				},
				err => {
					if (err) done(err);
					this.util.handleError("Password update failed");
				},
			);
	}

	forgotPassword(email: string): Observable<IUser> {
		return this.http.post('/api/v1/send-forgot-password', {email})
			.map((res: Response) => res.json())
			.catch(this.util.catchHttpError);
	}
}
