import { inject, injectable } from 'inversify'
import { cloneDeep } from 'lodash'
import { Document } from 'mongoose'

import { AppConfig } from '@mte/app-config'
import { Types } from '@mte/common/constants/inversify'
import { MongooseModel } from '@mte/common/lib/goosetype'
import { Attribute, AttributeModel } from '@mte/common/models/api-models/attribute'
import { AttributeValue, AttributeValueModel } from '@mte/common/models/api-models/attribute-value'
import { Price } from '@mte/common/models/api-models/price'
import { Product, ProductModel } from '@mte/common/models/api-models/product'
import { Taxonomy, TaxonomyModel } from '@mte/common/models/api-models/taxonomy'
import { TaxonomyTerm, TaxonomyTermModel } from '@mte/common/models/api-models/taxonomy-term'
import { ListFromIdsRequest, ListFromQueryRequest } from '@mte/common/models/api-requests/list.request'
import { ApiErrorResponse } from '@mte/common/models/api-responses/api-error.response'
import { ApiResponse } from '@mte/common/models/api-responses/api.response'
import { Currency } from '@mte/common/models/enums/currency'
import { ProductClass } from '@mte/common/models/enums/product-class'
import * as productsJSON from '@mte/common/work-files/migration/hyzershop-products'
import { DbClient } from '../data-access/db-client'

@injectable()
export class WoocommerceMigrationService {

    @inject(Types.DbClient) private dbClient: DbClient<any>

    public createProductsFromExportedJSON(): Promise<ApiResponse<Product[]>> {
        return new Promise<ApiResponse<Product[]>>(async (resolve, reject) => {
            const newProducts = []

            async function createProducts() {
                for (const product of productsJSON) {
                    console.log('Creating product:', product.SKU)
                    const newProduct: Product = cloneDeep(product)

                    const variableAttributeIds: string[] = []
                    const variableAttributeValueIds: string[] = []
                    const attributeValueIds: string[] = []
                    const taxonomyTermIds: string[] = []

                    const flightStats: {
                        fade: number
                        glide: number
                        speed: number
                        turn: number
                    } = {
                        fade: undefined,
                        glide: undefined,
                        speed: undefined,
                        turn: undefined,
                    }

                    for (const key of Object.keys(product)) {
                        if (typeof newProduct[key] !== 'undefined' && newProduct[key] !== undefined && newProduct[key] !== '') {

                            if (key.indexOf('attributes.') > -1) {
                                const theKey = key.replace('attributes.', '')
                                if (typeof product[key] === 'string') {
                                    if (product.class === 'Variable' && product[key].indexOf('|') > -1) {
                                        const value = product[key]
                                        const variableAttributeValueSlugs = product[key]
                                            .split('|')
                                            .map((val) => {
                                                return theKey + '-' + val.replace(/\s/g, '-').replace(/[\(\)]/g, '').toLowerCase()
                                            })
                                        const variableAttributeValueValues = product[key].split('|')
                                        const variableAttributeSlug = theKey
                                        try {
                                            const variableAttributeResponse = await AttributeModel.findOrCreate({
                                                slug: variableAttributeSlug
                                            })
                                            const variableAttribute = variableAttributeResponse.doc
                                            variableAttributeIds.push(variableAttribute._id)
                                            for (const variableAttributeValueSlug of variableAttributeValueSlugs) {
                                                try {
                                                    const variableAttributeValueResponse = await AttributeValueModel.findOrCreate({
                                                        attribute: variableAttribute._id,
                                                        slug: variableAttributeValueSlug,
                                                        value: variableAttributeValueValues[variableAttributeValueSlugs.indexOf(variableAttributeValueSlug)],
                                                    })
                                                    const variableAttributeValue = variableAttributeValueResponse.doc
                                                    variableAttributeValueIds.push(variableAttributeValue._id)
                                                }
                                                catch (error) {
                                                    reject(new ApiErrorResponse(error))
                                                }
                                            }
                                        }
                                        catch (error) {
                                            reject(new ApiErrorResponse(error))
                                            return
                                        }
                                    }
                                    else {
                                        const value = product[key]
                                        const attributeValueSlug = theKey + '-' + product[key].replace(/\s/g, '-').toLowerCase()
                                        const attributeSlug = theKey
                                        try {
                                            const attributeResponse = await AttributeModel.findOrCreate({
                                                slug: attributeSlug
                                            })
                                            const attribute = attributeResponse.doc
                                            const attributeValueResponse = await AttributeValueModel.findOrCreate({
                                                attribute: attribute._id,
                                                slug: attributeValueSlug,
                                                value,
                                            })
                                            const attributeValue = attributeValueResponse.doc
                                            attributeValueIds.push(attributeValue._id)
                                            delete newProduct[key]
                                        }
                                        catch (error) {
                                            reject(new ApiErrorResponse(error))
                                            return
                                        }
                                    }
                                }

                                if (theKey === 'fade' || theKey === 'glide' || theKey === 'turn' || theKey === 'speed') {
                                    flightStats[theKey] = product[key]

                                    const stability = function(stabilityStats): 'overstable'|'stable'|'understable' {
                                        if ( stabilityStats.fade + stabilityStats.turn >= 3 ) {
                                            return 'overstable'
                                        }
                                        else if ( stabilityStats.fade + stabilityStats.turn < 3 && stabilityStats.fade + stabilityStats.turn >= 0 ) {
                                            return 'stable'
                                        }
                                        else if ( stabilityStats.fade + stabilityStats.turn < 0 ) {
                                            return 'understable'
                                        }
                                    }

                                    if (Object.keys(flightStats).every(statKey => flightStats[statKey] !== undefined)) {
                                        try {
                                            const stabilityValue = stability(flightStats)
                                            const attributeSlug = 'stability'
                                            const taxonomySlug = 'stability'
                                            const attributeValueSlug = attributeSlug + '-' + stabilityValue
                                            const taxonomyTermSlug = taxonomySlug + '-' + stabilityValue

                                            const attributeResponse = await AttributeModel.findOrCreate({
                                                slug: attributeSlug,
                                            })
                                            const attribute = attributeResponse.doc
                                            const attributeValueResponse = await AttributeValueModel.findOrCreate({
                                                attribute: attribute._id,
                                                slug: attributeValueSlug,
                                                value: stabilityValue,
                                            })
                                            const attributeValue = attributeValueResponse.doc
                                            attributeValueIds.push(attributeValue._id)

                                            const taxonomyResponse = await TaxonomyModel.findOrCreate({
                                                slug: taxonomySlug,
                                            })
                                            const taxonomy = taxonomyResponse.doc
                                            const taxonomyTermResponse = await TaxonomyTermModel.findOrCreate({
                                                taxonomy: taxonomy._id,
                                                slug: taxonomyTermSlug,
                                            })
                                            const taxonomyTerm = taxonomyTermResponse.doc
                                            taxonomyTermIds.push(taxonomyTerm._id)
                                        }
                                        catch (error) {
                                            reject(new ApiErrorResponse(error))
                                            return
                                        }
                                    }
                                }
                            }
                            if (key.indexOf('taxonomies.') > -1) {
                                const taxonomyTermPromises: Promise<{ doc: TaxonomyTerm }>[] = []
                                const taxonomySlug = key.replace('taxonomies.', '')
                                const taxonomyTermSlugs = product[key].split('|').map((originalTaxonomyTermSlug) => {
                                    return key.replace('taxonomies.', '') + '-' + originalTaxonomyTermSlug.replace(/\s/g, '-').toLowerCase()
                                })
                                try {
                                    const taxonomyResponse = await TaxonomyModel.findOrCreate({ slug: taxonomySlug })
                                    const taxonomy = taxonomyResponse.doc

                                    taxonomyTermSlugs.forEach((taxonomyTermSlug) => {
                                        console.log('Taxonomy term promise')
                                        console.log(taxonomy._id, taxonomyTermSlug)
                                        taxonomyTermPromises.push(TaxonomyTermModel.findOrCreate({
                                            taxonomy: taxonomy._id,
                                            slug: taxonomyTermSlug
                                        }))
                                    })

                                    const taxonomyTermsResponse = await Promise.all(taxonomyTermPromises)
                                    const taxonomyTerms = taxonomyTermsResponse.map((taxonomyTermResponse) => taxonomyTermResponse.doc)

                                    taxonomyTerms.forEach((taxonomyTerm) => taxonomyTermIds.push(taxonomyTerm._id))

                                    newProduct.taxonomyTermSlugs = taxonomyTermSlugs
                                    delete newProduct[key]
                                }
                                catch (error) {
                                    reject(new ApiErrorResponse(error))
                                    return
                                }
                            }
                            if (key === 'netWeight') {
                                newProduct[key] = (newProduct[key] as any).replace(/g/g, '')
                                if ( (newProduct[key] as any).indexOf('|') > -1 ) {
                                    delete newProduct[key]
                                }
                            }
                            if (key === 'price') {
                                if ( newProduct[key].toString().indexOf('-') > -1 ) {
                                    const priceRangeTotals = (newProduct[key] as any).split('-')
                                    newProduct.priceRange = [
                                        {
                                            amount: 0,
                                            currency: Currency.USD,
                                        } as Price,
                                        {
                                            amount: 0,
                                            currency: Currency.USD,
                                        } as Price,
                                    ]
                                    newProduct.priceRange[0].amount = parseFloat(priceRangeTotals[0])
                                    newProduct.priceRange[1].amount = parseFloat(priceRangeTotals[1])
                                    delete newProduct[key]
                                }
                                else {
                                    newProduct[key] = {
                                        amount: +newProduct[key],
                                        currency: Currency.USD
                                    } as Price
                                }
                            }
                            if (key === 'salePrice') {
                                if ( newProduct.salePrice.toString().indexOf('-') > -1 ) {
                                    const salePriceRangeTotals = (newProduct[key] as any).split('-')
                                    newProduct.salePriceRange = [
                                        {
                                            amount: 0,
                                            currency: Currency.USD,
                                        } as Price,
                                        {
                                            amount: 0,
                                            currency: Currency.USD,
                                        } as Price,
                                    ]
                                    newProduct.salePriceRange[0].amount = parseFloat(salePriceRangeTotals[0])
                                    newProduct.salePriceRange[1].amount = parseFloat(salePriceRangeTotals[1])
                                    delete newProduct.salePrice
                                }
                                else {
                                    newProduct.salePrice = {
                                        amount: +newProduct[key],
                                        currency: Currency.USD
                                    } as Price
                                }
                            }

                            if (key === 'class') {
                                if ((<string>newProduct.class) === 'Variable') {
                                    newProduct.isParent = true
                                    newProduct.class = ProductClass.Parent
                                }
                                if ((<string>newProduct.class) === 'Variation') {
                                    newProduct.isVariation = true
                                    newProduct.class = ProductClass.Variation
                                }
                                if ((<string>newProduct.class) === 'Simple Product') {
                                    newProduct.isStandalone = true
                                    newProduct.class = ProductClass.Standalone
                                }
                            }

                            if (key === 'description') {
                                if (newProduct.description) {
                                    newProduct.description = newProduct.description.replace(/http:\/\/stage\.hyzershop\.com\/product/g, '/shop/product')
                                    newProduct.description = newProduct.description.replace(/Š—È/g, '\'')
                                    newProduct.description = newProduct.description.replace('<div class="longdescription">', '\n')
                                    newProduct.description = newProduct.description.replace('</div>', '')
                                }
                            }

                            if (key === 'SKU') {
                                newProduct.sku = newProduct[key]
                                delete newProduct[key]
                            }
                            if (key === 'parentSKU') {
                                newProduct.parentSku = newProduct[key]
                                delete newProduct[key]
                            }
                        }
                        else {
                            delete newProduct[key]
                        }
                    }

                    // !!!!!!!!!!!!!!!!!!
                    // One-off exceptions
                    // !!!!!!!!!!!!!!!!!!

                    const sku = newProduct.sku
                    if (sku === 'METEOR_GLOZ_1769') {
                        if (newProducts.find((p) => p.sku === 'METEOR_GLOZ_1769')) {
                            newProduct.sku = 'METEOR_GLOZ_1769_2'
                        }
                    }

                    /////////////////////

                    newProduct.variableAttributes = variableAttributeIds
                    newProduct.variableAttributeValues = variableAttributeValueIds
                    newProduct.attributeValues = attributeValueIds
                    newProduct.taxonomyTerms = taxonomyTermIds

                    delete (<any>newProduct).featuredImage
                    delete (<any>newProduct).thumbnail

                    newProducts.push(newProduct)
                }
            }

            try {
                await createProducts.call(this)
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
                return
            }

            /*************
             * The switch
             ******* -> */
            try {
                console.log('Creating products')
                const allProducts = await this.dbClient.create<Product>(ProductModel, newProducts)
                const parentProducts = allProducts.filter((p) => p.isParent)

                // Populate the `variations` array.

                for (let i = 0; i < parentProducts.length; i++) {
                    const parentProduct = parentProducts[i]
                    const variations = allProducts.filter((p) => p.parentSku === parentProduct.sku)
                    parentProduct.variations = variations.map((v) => v._id)
                    await parentProduct.save()
                }

                // Populate the images.

                for (let i = 0; i < allProducts.length; i++) {
                    const product = allProducts[i]
                    product.featuredImages = []
                    product.largeImages = []
                    product.images = []
                    product.thumbnails = []

                    if (!product.isParent) {
                        let isDisc: boolean
                        let attributeValues: AttributeValue[]
                        let taxonomyTerms: TaxonomyTerm[]
                        let imageBaseUrl = `${AppConfig.cloudfront_url}/production/product-images/`

                        if (product.taxonomyTermSlugs) {
                            product.taxonomyTermSlugs.forEach(term => {
                                if (term.indexOf('brand') === 0) {
                                    if (term.match(/mvp/ig)) {
                                        imageBaseUrl += 'mvp-'
                                    }
                                    if (term.match(/axiom/ig)) {
                                        imageBaseUrl += 'axiom-'
                                    }
                                    if (term.match(/discraft/ig)) {
                                        imageBaseUrl += 'discraft-'
                                    }
                                }
                            })
                        }

                        try {
                            attributeValues = await this.dbClient.findIds(AttributeValueModel, new ListFromIdsRequest({ ids: product.attributeValues })) as AttributeValue[]
                            taxonomyTerms = await this.dbClient.findIds(TaxonomyTermModel, new ListFromIdsRequest({ ids: product.taxonomyTerms }))
                            isDisc = taxonomyTerms && taxonomyTerms.some((taxTerm) => taxTerm.slug === 'productType-discs')
                        }
                        catch (error) {
                            reject(new ApiErrorResponse(error))
                            return
                        }

                        const name = product.name.substr(0, product.name.indexOf(' -'))
                        imageBaseUrl += `${name.toLowerCase().replace(/\W/g, '-')}-`

                        if (isDisc) {
                            console.log('Loop through attribute values')
                            attributeValues.forEach((attributeValue) => {
                                if (attributeValue && attributeValue.slug.indexOf('plastic') > -1) {
                                    console.log('Add plastic to filename', imageBaseUrl, attributeValue)
                                    const plasticStr = attributeValue.value
                                        .toLowerCase()
                                        .replace(/\W/g, '')

                                    imageBaseUrl += `${plasticStr}-`
                                }
                            })
                            if (product.netWeight) {
                                let netWeightStr = product.netWeight.toString()
                                    .replace('.', '')
                                if (netWeightStr.length === 2) netWeightStr += '00'
                                if (netWeightStr.length === 3) netWeightStr += '0'
                                imageBaseUrl += netWeightStr
                            }
                        } else {
                            attributeValues.forEach((attributeValue) => {
                                if (attributeValue && attributeValue.slug.indexOf('color') > -1) {
                                    imageBaseUrl += `${attributeValue.value.toLowerCase()}-`
                                }
                            })
                        }

                        imageBaseUrl.replace(/--/g, '-')

                        product.thumbnails.push(imageBaseUrl + '-thumbnail.png')
                        product.featuredImages.push(imageBaseUrl + '-medium.png')
                        product.largeImages.push(imageBaseUrl + '-large.png')
                    }

                    await product.save()
                }

                // Populate parent product images with variation images.

                for (let i = 0; i < parentProducts.length; i++) {
                    const product = parentProducts[i]
                    let variations = []
                    if (product.isParent) {
                        variations = allProducts.filter(p => product.sku === p.parentSku)
                        variations.forEach((pv) => {
                            product.images = product.images.concat(pv.images)
                            product.featuredImages = product.featuredImages.concat(pv.featuredImages)
                            product.largeImages = product.largeImages.concat(pv.largeImages)
                            product.thumbnails = product.thumbnails.concat(pv.thumbnails)
                        })
                    }

                    await product.save()
                }

                resolve(new ApiResponse(allProducts))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
            /**/
        })
    }
}
