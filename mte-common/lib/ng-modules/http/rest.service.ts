import { HttpClient, HttpErrorResponse, HttpEvent, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { ListFromIdsRequest, ListRequest } from '../../../models/api-requests/list.request'
import { SimpleError } from './http.models'

export abstract class RestService<T> {
    public abstract endpoint: string
    public getRequestType? = ListRequest
    public getSomeRequestType? = ListFromIdsRequest

    public documents: T[]
    protected getPump = new Subject<T[]>()
    public getSource: Observable<T[]>
    protected getErrorPump = new Subject<SimpleError>()
    public getErrorSource: Observable<SimpleError>

    constructor(protected http: HttpClient) {
        this.getSource = this.getPump.asObservable()
        this.getErrorSource = this.getErrorPump.asObservable()

        this.getSource.subscribe(documents => {
            this.documents = documents
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

    public getOne(id: string): Observable<T> {
        return this.http.get<T>(`${this.endpoint}/${id}`)
    }

    public create?(doc: T): void
    public update?(id: string, update: object): void
    public delete?(id: string): void
}
