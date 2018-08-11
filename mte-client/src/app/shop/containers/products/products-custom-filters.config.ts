export interface ProductsCustomFilterDisplayWhen {
    taxonomyTerm: string
}

export enum ProductsCustomFilterType {
    TaxonomyTermChecklist,
    AttributeValueChecklist,
}

export class ProductsCustomFilter {
    public displayWhen: ProductsCustomFilterDisplayWhen
    public filterType: ProductsCustomFilterType
}

export type ProductsCustomFiltersConfig = ProductsCustomFilter[]
