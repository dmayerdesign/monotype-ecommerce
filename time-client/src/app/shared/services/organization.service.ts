import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Subject } from 'rxjs/Subject'

import { ApiEndpoints } from '@time/common/constants/api-endpoints'
import { Organization } from '@time/common/models/api-models/organization'
import { SimpleError } from '@time/common/ng-modules/http'

@Injectable()
export class OrganizationService {
    public organization: Organization
    private organizationSubject = new ReplaySubject<Organization>(1)
    public organization$ = this.organizationSubject.asObservable()
    private organizationErrorSubject = new Subject<SimpleError>()
    public organizationError$ = this.organizationErrorSubject.asObservable()

    constructor (
        private http: HttpClient,
    ) {
        this.get()
    }

    public get() {
        this.http.get<Organization>(ApiEndpoints.Organization)
            .subscribe(
                organization => {
                    this.organization = organization
                    this.organizationSubject.next(organization)
                },
                (error: SimpleError) => this.organizationErrorSubject.next(error),
            )
    }
}
