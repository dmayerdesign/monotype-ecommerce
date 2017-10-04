import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http'
import { EventEmitter, Inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { appConfig } from '@time/app-config'
import { ProductSearch } from '@time/common/api-utils'
import { IProduct } from '@time/common/models/interfaces'
import { SimpleError } from '@time/common/ng-modules/http'
import { UserService, UtilService } from '../../shared/services'

@Injectable()
export class ProductService {
    public products$: Observable<IProduct[]>
    public productsError$: Observable<SimpleError>
    private productsSubject = new Subject<IProduct[]>()
    private productsErrorSubject = new Subject<SimpleError>()

    constructor (
        private http: HttpClient,
        private userService: UserService,
    ) {
        this.products$ = this.productsSubject.asObservable()
        this.productsError$ = this.productsErrorSubject.asObservable()
    }

    public get(page?: number, query?: ProductSearch.Body): void {
        const params = new HttpParams()
        const headers = new HttpHeaders({authorization: "bearer " + this.userService.token})

        if (page) params.set("page", page + "")
        if (query) params.set("page", JSON.stringify(query))

        console.log({ params, headers })

        // this.http.get("https://jsonplaceholder.typicode.com/posts")
        this.http.get(appConfig.client_url + "/api/products", { params, headers })
            .subscribe(
                (products: IProduct[]) => this.productsSubject.next(products),
                (error: SimpleError) => this.productsErrorSubject.next(error),
            )
    }

    public getOne(slug: string): void {
        this.http.get(appConfig.client_url + "/api/product/" + slug)
            .subscribe(
                (products: IProduct[]) => this.productsSubject.next(products),
                (error: SimpleError) => this.productsErrorSubject.next(error),
            )
    }
}
