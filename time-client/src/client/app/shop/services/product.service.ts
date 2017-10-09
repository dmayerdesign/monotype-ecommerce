import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http'
import { EventEmitter, Inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Subject } from 'rxjs/Subject'

import { appConfig } from '@time/app-config'
import { ProductSearch } from '@time/common/api-utils'
import { IPrice, IProduct } from '@time/common/models/interfaces'
import { SimpleError } from '@time/common/ng-modules/http'
import { UserService, UtilService } from '../../shared/services'

@Injectable()
export class ProductService {
    public products$: Observable<IProduct[]>
    public productsError$: Observable<SimpleError>
    private productsSubject = new ReplaySubject<IProduct[]>()
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

    public displayOne(slug: string): Observable<IProduct> {
        return this.products$.map(p => p.find(product => product.slug === slug))
    }

    public getOne(slug: string): Observable<IProduct> {
        return this.http.get<IProduct>(appConfig.client_url + "/api/product/" + slug)
    }

    public getPrice(product: IProduct): IPrice {
        if (product.isOnSale) {
            return product.salePrice
        }
        else {
            return product.price
        }
    }
}
