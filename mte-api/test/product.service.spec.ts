import { GetProductsRequest } from '@mte/common/api/requests/get-products.request'
import 'reflect-metadata'
import { DbClient } from '../data-access/db-client'
import { ProductSearchHelper } from '../helpers/product-search.helper'
import { CrudService } from '../services/crud.service'
import { OrganizationService } from '../services/organization.service'
import { ProductService } from '../services/product.service'

const productService = new ProductService(
    new DbClient(),
    new ProductSearchHelper(),
    new OrganizationService(new DbClient())
)

describe('ProductService', () => {
    it('should be an instance of CrudService', () => {
        expect(productService instanceof CrudService).toBe(true)
    })
})

