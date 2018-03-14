import { HttpClient, HttpErrorResponse, HttpEvent, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { HttpStatus } from '../../constants/http-status'
import { ListFromIdsRequest, ListRequest } from '../../models/api-requests/list.request'

export class SimpleError {
    public message: string
    public status: HttpStatus

    constructor(errorResponse?: HttpErrorResponse & HttpEvent<any>) {
        if (errorResponse) {
            this.message = errorResponse.error ? errorResponse.error.message : null
            this.status = errorResponse.status
        }
    }
}

export abstract class RestService<T> {
    public abstract endpoint: string
    public getRequestType? = ListRequest
    public getSomeRequestType? = ListFromIdsRequest

    protected getPump = new Subject<T[]>()
    protected getOnePump = new Subject<T>()
    protected getOneSlugPump = new Subject<T>()
    protected createPump = new Subject<T>()
    protected updatePump = new Subject<T>()
    protected deletePump = new Subject<T>()

    protected getErrorPump = new Subject<SimpleError>()
    protected getOneErrorPump = new Subject<SimpleError>()
    protected getOneSlugErrorPump = new Subject<SimpleError>()
    protected createErrorPump = new Subject<SimpleError>()
    protected updateErrorPump = new Subject<SimpleError>()
    protected deleteErrorPump = new Subject<SimpleError>()

    public data: T[]
    public getSource: Observable<T[]>
    public getOneSource: Observable<T>
    public getOneSlugSource: Observable<T>
    public createSource: Observable<T>
    public updateSource: Observable<T>
    public deleteSource: Observable<T>

    public getErrorSource: Observable<SimpleError>
    public getOneErrorSource: Observable<SimpleError>
    public getOneSlugErrorSource: Observable<SimpleError>
    public createErrorSource: Observable<SimpleError>
    public updateErrorSource: Observable<SimpleError>
    public deleteErrorSource: Observable<SimpleError>

    constructor(protected http: HttpClient) {
        this.getSource = this.getPump.asObservable()
        this.getOneSource = this.getOnePump.asObservable()
        this.getOneSlugSource = this.getOneSlugPump.asObservable()
        this.createSource = this.createPump.asObservable()
        this.updateSource = this.updatePump.asObservable()
        this.deleteSource = this.deletePump.asObservable()

        this.getErrorSource = this.getErrorPump.asObservable()
        this.getOneErrorSource = this.getOneErrorPump.asObservable()
        this.getOneSlugErrorSource = this.getOneSlugErrorPump.asObservable()
        this.createErrorSource = this.createErrorPump.asObservable()
        this.updateErrorSource = this.updateErrorPump.asObservable()
        this.deleteErrorSource = this.deleteErrorPump.asObservable()

        this.getSource.subscribe(data => {
            this.data = data
        })
    }

    public get(request?: ListRequest): void {
        let params = new HttpParams()

        if (request) params = params.set('request', JSON.stringify(request))

        this.http.get<T[]>(this.endpoint, { params })
            .subscribe(
                (docs) => this.getPump.next(docs),
                (error: SimpleError) => this.getErrorPump.next(error),
            )
    }

    public getSome(ids: string[]): Observable<T[]> {
        const request = new this.getSomeRequestType()
        request.ids = ids

        const params = new HttpParams().set('request', JSON.stringify(request))

        return this.http.get<T[]>(this.endpoint, { params })
    }

    public getOne(id: string): void {
        this.http.get<T>(`${this.endpoint}/${id}`)
            .subscribe(
                (doc) => this.getOnePump.next(doc),
                (error: SimpleError) => this.getOneErrorPump.next(error),
            )
    }

    public create?(): void
    public update?(id: string, update: object): void
    public delete?(id: string): void
}

export abstract class IHttpSettings {
    public static httpFlashErrorBlacklist: { endpoint: string, method: string }[]
}
