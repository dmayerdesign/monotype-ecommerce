import { Attribute } from '@mte/common/models/api-models/attribute'
import { AttributeValue } from '@mte/common/models/api-models/attribute-value'
import { Price } from '@mte/common/models/api-models/price'
import { Product } from '@mte/common/models/api-models/product'
import { SimpleAttributeValue } from '@mte/common/models/api-models/simple-attribute-value'
import { TaxonomyTerm } from '@mte/common/models/api-models/taxonomy-term'
import { Currency } from '@mte/common/models/enums/currency'
import { VariableAttributeSelectOption } from '@mte/common/models/ui-models/variable-attribute-select'

export class ProductHelper {
    public static getBrand(product: Product): TaxonomyTerm {
        return product ? product.taxonomyTerms.find((t: TaxonomyTerm) => t.slug.indexOf('brand') > -1) as TaxonomyTerm : null
    }

    public static hasPriceRange(product: Product): boolean {
        return product.isOnSale
            ? !!product.salePriceRange && !!product.salePriceRange.length
            : !!product.priceRange && !!product.priceRange.length
    }

    public static getPrice(product: Product): Price | Price[] {
        if (product.isOnSale) {
            if (this.hasPriceRange(product)) {
                return product.salePriceRange
            }
            if (product.salePrice) {
                return product.salePrice
            }
        }
        else if (this.hasPriceRange(product)) {
            return product.priceRange
        }
        else if (product.price) {
            return product.price
        }
        return {
            amount: 0,
            currency: Currency.USD,
        }
    }

    public static getPriceString(product: Product): string {
        if (this.hasPriceRange(product)) {
            return `$${(this.getPrice(product) as Price[])[0].amount.toFixed(2)} - $${(this.getPrice(product) as Price[])[1].amount.toFixed(2)}`
        }
        else {
            return `$${(this.getPrice(product) as Price).amount.toFixed(2)}`
        }
    }

    public static getName(product: Product): string {
        if (product.isParent || product.isStandalone || !product.parent || !(product.parent as Product)._id) {
            return product.name
        } else {
            return (product.parent as Product).name
        }
    }

    public static isAttributeValue(data: any): boolean {
        return !!data && !!data.slug
    }
    public static isSimpleAttributeValue(data: any): boolean {
        return !!data && !data.slug
    }
}