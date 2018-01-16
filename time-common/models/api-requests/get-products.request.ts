import { ListFromIdsRequest, ListFromSearchRequest } from './list.request'

export interface IGetProductsFilter {
    type: 'property'|'attribute'|'taxonomy'
    key: string
    values?: any[]
    range?: number[]
}

export class GetProductsRequest extends ListFromSearchRequest {
    public filters?: IGetProductsFilter[]

    constructor(request?: GetProductsRequest) {
        super(request)
        if (request) {
            if (typeof request.filters !== 'undefined') this.filters = request.filters
        }
    }
}

export class GetProductsFromIdsRequest extends ListFromIdsRequest { }
