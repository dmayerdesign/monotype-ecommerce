import { Injectable, Inject, EventEmitter } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, CanActivateChild } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { IProduct } from '../../../../../../time-common/models/interfaces';
import { UtilService } from './util.service';

@Injectable()
export class ProductService {
    constructor (
		private http: Http,
		private router: Router,
		private util: UtilService,
	) {}

    get(): Observable<IProduct[]> {
        return this.http.get('/api/v1/products').map(res => res.json());
    }
}