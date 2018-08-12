import { ProductsFilter } from '@mte/common/models/api-interfaces/products-filter'
import { ProductsFilterType } from '@mte/common/models/enums/products-filter-type'

// TODO: Move this into the database (`organizations.0.storeUiSettings.productsFilters`).

export const productsFilters: ProductsFilter[] = [
    {
        filterType: ProductsFilterType.PriceRange,
        enabled: true,
        displayAlways: true,
    },
    {
        filterType: ProductsFilterType.Categories,
        enabled: true,
        displayAlways: true,
    },
    {
        filterType: ProductsFilterType.Brands,
        enabled: true,
        displayAlways: true,
    },
    {
        filterType: ProductsFilterType.Colors,
        enabled: true,
        displayAlways: true,
    },
    {
        label: 'Disc types',
        filterType: ProductsFilterType.TaxonomyTermChecklist,
        enabled: true,
        displayWhen: {
            taxonomyTerm: 'product-type-discs',
        },
        taxonomyTermOptions: [
            '5b678faa0546cc3971bf5310',
            '5b678faa0546cc3971bf5329',
            '5b678faa0546cc3971bf5334',
            '5b678faa0546cc3971bf533a',
        ],
    },
    {
        label: 'Stabilities',
        filterType: ProductsFilterType.TaxonomyTermChecklist,
        enabled: true,
        displayWhen: {
            taxonomyTerm: 'product-type-discs',
        },
        taxonomyTermOptions: [
            '5b678faa0546cc3971bf5326',
            '5b678fab0546cc3971bf534f',
            '5b678fac0546cc3971bf5366',
        ]
    },
]
