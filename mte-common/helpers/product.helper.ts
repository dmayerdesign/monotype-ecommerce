import { Product } from '@mte/common/models/api-models/product'
import { TaxonomyTerm } from '@mte/common/models/api-models/taxonomy-term'

export class ProductHelper {
    public static getBrand(product: Product): TaxonomyTerm {
        return product ? product.taxonomyTerms.find((t: TaxonomyTerm) => t.slug.indexOf('brand') > -1) as TaxonomyTerm : null
    }
}
