import { ListFromIdsRequest, ListFromSearchRequest } from './list.request'

export interface GetProductsFilter {
    type: 'property'|'attribute'|'taxonomy'
    key: string
    values?: any[]
    range?: number[]
}

export class GetProductsRequest extends ListFromSearchRequest {
    public filters?: GetProductsFilter[]

    constructor(request?: GetProductsRequest) {
        super(request)
        if (request) {
            if (typeof request.filters !== 'undefined') this.filters = request.filters
        }
    }
}

export class GetProductsFromIdsRequest extends ListFromIdsRequest { }
