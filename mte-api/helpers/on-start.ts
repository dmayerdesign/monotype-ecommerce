import { ProductsFilterType } from '@mte/common/constants/enums/products-filter-type'
import * as rp from 'request-promise-native'
import { DbClient } from '../data-access/db-client'
import { OrganizationService } from '../services/organization.service'


export async function onStart(): Promise<void> {
    const dbClient = new DbClient()
    const organizationService = new OrganizationService(dbClient)

    // Keep the server from going to sleep.

    setInterval(function() {
        rp({uri: process.env.CLIENT_URL + '/ping'})
    }, 1000 * 60 * 15/*minutes*/)

    // TODO: Create default database documents if not created already, and set
    // `defaultsHaveBeenCreated` to `true` on the documents.

    const getOrganizationResponse = await organizationService.getOrganization()
    const organization = getOrganizationResponse.body
    if (!organization.defaultsHaveBeenSet) {
        organizationService.updateOne(organization._id, {
            storeUiSettings: {
                ...organization.storeUiSettings,
                productsFilters: [
                    {
                        filterType: ProductsFilterType.PriceRange,
                        enabled: true,
                        displayAlways: true,
                    },
                    {
                        filterType: ProductsFilterType.ProductTypes,
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
                ]
            }
        })
    }
}
