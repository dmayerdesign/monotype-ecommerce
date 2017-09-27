import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { EventEmitter, Inject, Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs/Rx'

import { appConfig } from '@time/app-config'
import { ProductSearch } from '@time/common/api-utils'
import { SimpleError } from '@time/common/http'
import { IProduct } from '@time/common/models/interfaces'
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
    ) {
        this.products$ = this.productsSubject.asObservable()
        this.productsError$ = this.productsErrorSubject.asObservable()
    }

    public get(page?: number, query?: ProductSearch.Body): void {
        const params = new HttpParams()
        if (page) params.set("page", page + "")
        if (query) params.set("page", JSON.stringify(query))

        setInterval(() => {
            this.http.get("https://jsonplaceholder.typicode.com/posts")
            // this.http.get(appConfig.client_url + "/api/products", { params })
                .subscribe(
                    (products: IProduct[]) => this.productsSubject.next(products),
                    (error: SimpleError) => this.productsErrorSubject.next(error),
                )
        }, 2000)
    }

    public getOne(slug: string): void {
        this.http.get(appConfig.client_url + "/api/product/" + slug)
            .subscribe(
                (products: IProduct[]) => this.productsSubject.next(products),
                (error: SimpleError) => this.productsErrorSubject.next(error),
            )
    }
}
