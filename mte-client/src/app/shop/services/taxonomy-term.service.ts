import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'
import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { RestService, SimpleError } from '@mte/common/lib/ng-modules/http'
import { TaxonomyTerm } from '@mte/common/models/api-models/taxonomy-term'
import { GetTaxonomyTermsFromIdsRequest, GetTaxonomyTermsRequest } from '@mte/common/models/api-requests/get-taxonomy-terms.request'

@Injectable()
export class TaxonomyTermService extends RestService<TaxonomyTerm> {
    public endpoint = ApiEndpoints.TaxonomyTerms

    constructor (
        protected http: HttpClient,
    ) { super(http) }
}
