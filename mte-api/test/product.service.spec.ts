import { AttributeValue } from '@mte/common/api/entities/attribute-value'
import { Product } from '@mte/common/api/entities/product'
import { TaxonomyTerm } from '@mte/common/api/entities/taxonomy-term'
import { ApiResponse } from '@mte/common/api/responses/api.response'
import { Crud } from '@mte/common/constants'
import 'reflect-metadata'
import { DbClient } from '../data-access/db-client'
import { ProductSearchHelper } from '../helpers/product-search.helper'
import { OrganizationService } from '../services/organization.service'
import { ProductService } from '../services/product.service'
import { initTestDbSetupAndTeardown } from './init-test-db-setup-and-teardown'

describe('ProductService', () => {
    let dbClient: DbClient<Product>
    let productService: ProductService

    initTestDbSetupAndTeardown()

    beforeEach(() => {
        dbClient = new DbClient<Product>()
        productService = new ProductService(
            dbClient,
            new ProductSearchHelper(),
            new OrganizationService(dbClient)
        )
    })

    test('should get a single product by slug', async (done) => {
        const { body } = await productService.getOneSlug('mvp-photon')
        expect(body.slug).toBe('mvp-photon')
        done()
    })

    test('should get a single product by slug', async (done) => {
        const { body: product } = await productService.getOneSlug('mvp-photon')
        expect(product.slug).toBe('mvp-photon')
        done()
    })

    test('should get an almost-fully-populated product by slug', async (done) => {
        const { body: product } = await productService.getProductDetail('mvp-photon')
        expect(product.slug).toBe('mvp-photon')
        expect(product.taxonomyTerms.every((taxonomyTerm) =>
            typeof taxonomyTerm === 'object'))
        expect(product.taxonomyTerms.every((taxonomyTerm: TaxonomyTerm) =>
            typeof taxonomyTerm.taxonomy === 'object'))
        expect(product.attributeValues.every((attributeValue) =>
            typeof attributeValue === 'object'))
        expect(product.attributeValues.every((attributeValue: AttributeValue) =>
            typeof attributeValue.attribute === 'object'))
        expect(product.variations.every((variation: Product) =>
            typeof variation === 'object' &&
            variation.attributeValues.every((attributeValue: AttributeValue) =>
                typeof attributeValue.attribute === 'object')))
        done()
    })

    test('should get a partially-populated list of products', async (done) => {
        const { body: products } = await productService.getProducts() as ApiResponse<Product[]>
        expect(products.length).toBe(Crud.Pagination.productsPerPage)
        done()
    })
})

