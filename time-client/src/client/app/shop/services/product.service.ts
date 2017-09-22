import { Injectable, Inject, EventEmitter } from '@angular/core'
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/catch';

import { appConfig } from '@time/app-config'
import { TimeHttpService, SimpleError } from '@time/common/http'
import { IProduct } from '@time/common/models/interfaces'
import { ProductSearch } from '@time/common/api-utils'
import { UtilService } from '../../shared/services'

@Injectable()
export class ProductService {
    public products$: Observable<IProduct[]>
    public productsError$: Observable<SimpleError>
    private productsSubject = new Subject<IProduct[]>()
    private productsErrorSubject = new Subject<SimpleError>()
    
    constructor (
        private http: HttpClient,
        private util: UtilService,
        private httpService: TimeHttpService,
    ) {
        this.products$ = this.productsSubject.asObservable()
        this.productsError$ = this.productsErrorSubject.asObservable()
    }

    get(page?: number, query?: ProductSearch.Body): void {
        const params = new HttpParams()
        if (page) params.set("page", page + "")
        if (query) params.set("page", JSON.stringify(query))

        this.http.get(appConfig.client_url + "/api/products", { params })
            .subscribe(
                (products: IProduct[]) => this.productsSubject.next(products),
                (error: HttpErrorResponse) => this.productsErrorSubject.next(new SimpleError(error)),
            )
    }

    getOne(slug: string): void {
        this.http.get(appConfig.client_url + "/api/product/" + slug)
            .subscribe(
                (products: IProduct[]) => this.productsSubject.next(products),
                (error: HttpErrorResponse) => this.productsErrorSubject.next(new SimpleError(error)),
            )
    }
}
