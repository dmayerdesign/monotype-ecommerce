export namespace ProductSearch {

    export interface Filter {
        type: 'property'|'attribute'|'taxonomy'
        key: string
        values?: any[]
        range?: number[]
    }

    export interface Body {
        search?: string
        filters?: Array<Filter>
        page?: number
    }

}