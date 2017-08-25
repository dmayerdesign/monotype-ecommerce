import { Injectable, Inject, EventEmitter } from '@angular/core'
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http'
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, CanActivateChild } from '@angular/router'
import { Observable, Subject } from 'rxjs'

import { appConfig } from '../../../../../../time-common/config/app-config'
import { IProduct } from '../../../../../../time-common/models/interfaces'
import { UtilService } from '../../shared/services/util.service'

@Injectable()
export class ProductService {
    constructor (
		private http: HttpClient,
		private util: UtilService,
	) {}

    get(): Observable<IProduct[]> {
        return <Observable<IProduct[]>>this.http.get(appConfig.client_url + '/api/v1/products')
    }
    
}