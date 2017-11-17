import { ListRequest } from './list.request'

export interface IGetProductsFilter {
    type: 'property'|'attribute'|'taxonomy'
    key: string
    values?: any[]
    range?: number[]
}

export class GetProductsRequest extends ListRequest {
    public search?: string
    public ids?: string[]

    constructor(
        public filters?: IGetProductsFilter[]
    ) {
        super()
    }
}
