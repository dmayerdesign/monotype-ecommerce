import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, ReplaySubject, Subject } from 'rxjs'

import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { SimpleError } from '@mte/common/lib/ng-modules/http'
import { Organization } from '@mte/common/models/api-interfaces/organization'

@Injectable({ providedIn: 'root' })
export class OrganizationService {
    public organization: Organization
    private organizationPump = new ReplaySubject<Organization>(1)
    public organizations = this.organizationPump.asObservable()
    private organizationErrorPump = new Subject<SimpleError>()
    public organizationErrors = this.organizationErrorPump.asObservable()

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
                    this.organizationPump.next(organization)
                },
                (error: SimpleError) => this.organizationErrorPump.next(error),
            )
    }

    public getName(): string {
        if (this.organization) {
            return this.organization.branding.displayName
        }
        else return ''
    }
}
