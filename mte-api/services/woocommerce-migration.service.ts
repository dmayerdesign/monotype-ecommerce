import { pluralize, singularize, titleize } from 'inflection'
import { inject, injectable } from 'inversify'
import { cloneDeep, kebabCase } from 'lodash'
import { Document } from 'mongoose'

import { AppConfig } from '@mte/app-config'
import { Types } from '@mte/common/constants/inversify'
import { Attribute } from '@mte/common/models/api-models/attribute'
import { AttributeValue } from '@mte/common/models/api-models/attribute-value'
import { Image } from '@mte/common/models/api-models/image'
import { Price } from '@mte/common/models/api-models/price'
import { Product } from '@mte/common/models/api-models/product'
import { Taxonomy } from '@mte/common/models/api-models/taxonomy'
import { TaxonomyTerm } from '@mte/common/models/api-models/taxonomy-term'
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

            const dropAllProductRelatedCollections = async () => {
                await this.dbClient.remove(Product, {})
                await this.dbClient.remove(Attribute, {})
                await this.dbClient.remove(AttributeValue, {})
                await this.dbClient.remove(Taxonomy, {})
                await this.dbClient.remove(TaxonomyTerm, {})
            }

            await dropAllProductRelatedCollections()

            const buildProducts = async () => {
                for (const product of productsJSON) {
                    console.log('Creating product:', product.SKU)
                    const newProduct: Product = cloneDeep(product)

                    const variableAttributeIds: string[] = []
                    const variableAttributeValueIds: string[] = []
                    const attributeValueIds: string[] = []
                    const simpleAttributeValues: { attribute: string, value: any }[] = []
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
                                                return kebabCase(theKey + '-' + val.replace(/\s/g, '-').replace(/[\(\)]/g, '').toLowerCase())
                                            })
                                        const variableAttributeValueValues = product[key].split('|')
                                        const variableAttributeSlug = theKey
                                        try {
                                            const variableAttribute = await this.dbClient.findOrCreate(Attribute, {
                                                slug: variableAttributeSlug
                                            })
                                            console.log('findOrCreate: ' + variableAttributeSlug)
                                            variableAttributeIds.push(variableAttribute._id)
                                            for (const variableAttributeValueSlug of variableAttributeValueSlugs) {
                                                try {
                                                    const variableAttributeValue = await this.dbClient.findOrCreate(AttributeValue, {
                                                        attribute: variableAttribute._id,
                                                        slug: variableAttributeValueSlug,
                                                        value: variableAttributeValueValues[variableAttributeValueSlugs.indexOf(variableAttributeValueSlug)],
                                                    })
                                                    console.log('findOrCreate: ' + variableAttributeValueSlug)
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
                                        const attributeValueSlug = kebabCase(theKey + '-' + product[key].replace(/\s/g, '-').replace(/[\(\)]/g, '').toLowerCase())
                                        const attributeSlug = theKey
                                        try {
                                            const attribute = await this.dbClient.findOrCreate(Attribute, {
                                                slug: attributeSlug
                                            })
                                            console.log('findOrCreate: ' + attributeSlug)
                                            const attributeValue = await this.dbClient.findOrCreate(AttributeValue, {
                                                attribute: attribute._id,
                                                slug: attributeValueSlug,
                                                value,
                                            })
                                            console.log('findOrCreate: ' + attributeValueSlug)
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
                                    flightStats[theKey] = newProduct[key]

                                    // Add speed/glide/turn/fade Attribute.

                                    const speedGlideTurnFadeAttribute = await this.dbClient.findOrCreate(Attribute, { slug: theKey })
                                    console.log('findOrCreate: ' + theKey)
                                    simpleAttributeValues.push({
                                        attribute: speedGlideTurnFadeAttribute._id,
                                        value: flightStats[theKey]
                                    })

                                    // Add stability AttributeValue and TaxonomyTerm.

                                    const getStability = function(stabilityStats): 'overstable'|'stable'|'understable' {
                                        if ( (stabilityStats.fade + stabilityStats.turn) >= 3 ) {
                                            return 'overstable'
                                        }
                                        else if ( (stabilityStats.fade + stabilityStats.turn) < 3 && (stabilityStats.fade + stabilityStats.turn) >= 0 ) {
                                            return 'stable'
                                        }
                                        else if ( (stabilityStats.fade + stabilityStats.turn) < 0 ) {
                                            return 'understable'
                                        }
                                    }

                                    if (Object.keys(flightStats).every(statKey => typeof flightStats[statKey] !== 'undefined')) {
                                        try {
                                            const stabilityValue = getStability(flightStats)
                                            const attributeSlug = 'stability'
                                            const taxonomySlug = 'stability'
                                            const attributeValueSlug = attributeSlug + '-' + stabilityValue
                                            const taxonomyTermSlug = taxonomySlug + '-' + stabilityValue

                                            const attribute = await this.dbClient.findOrCreate(Attribute, {
                                                slug: attributeSlug,
                                            })
                                            const attributeValue = await this.dbClient.findOrCreate(AttributeValue, {
                                                attribute: attribute._id,
                                                slug: attributeValueSlug,
                                                value: stabilityValue,
                                            })
                                            console.log('findOrCreate: ' + attributeSlug + 'and' + attributeValueSlug)
                                            attributeValueIds.push(attributeValue._id)

                                            const taxonomy = await this.dbClient.findOrCreate(Taxonomy, {
                                                slug: taxonomySlug,
                                            })
                                            const taxonomyTerm = await this.dbClient.findOrCreate(TaxonomyTerm, {
                                                taxonomy: taxonomy._id,
                                                slug: taxonomyTermSlug,
                                            })
                                            console.log('findOrCreate: ' + taxonomySlug + 'and' + taxonomyTermSlug)
                                            taxonomyTermIds.push(taxonomyTerm._id)
                                        }
                                        catch (error) {
                                            reject(new ApiErrorResponse(error))
                                            return
                                        }
                                    }
                                }

                                if (theKey === 'inboundsId') {
                                    const inboundsIdAttribute = await this.dbClient.findOrCreate(Attribute, { slug: kebabCase(theKey) })
                                    simpleAttributeValues.push({
                                        attribute: inboundsIdAttribute._id,
                                        value: newProduct[key]
                                    })
                                }
                            }

                            if (key.indexOf('taxonomies.') > -1) {
                                const taxonomyTermPromises: Promise<TaxonomyTerm>[] = []
                                const taxonomySlug = kebabCase(key.replace('taxonomies.', ''))
                                const taxonomyTermSlugs = product[key].split('|').map((originalTaxonomyTermSlug) => {
                                    return kebabCase(key.replace('taxonomies.', '') + '-' + originalTaxonomyTermSlug.replace(/\s/g, '-').toLowerCase()).trim()
                                })

                                try {
                                    const taxonomy = await this.dbClient.findOrCreate(Taxonomy, { slug: taxonomySlug })

                                    taxonomyTermSlugs.forEach((taxonomyTermSlug) => {
                                        taxonomyTermPromises.push(this.dbClient.findOrCreate(TaxonomyTerm, {
                                            taxonomy: taxonomy._id,
                                            slug: taxonomyTermSlug
                                        }))
                                    })

                                    const taxonomyTerms = await Promise.all(taxonomyTermPromises)

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
                                if ((newProduct[key] as any).indexOf('|') > -1) {
                                    if (!newProduct.variableProperties) {
                                        newProduct.variableProperties = []
                                    }
                                    newProduct.variableProperties.push('netWeight')
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

                            if (key === 'name') {
                                newProduct.name = newProduct.name.replace(/ŠÜ¢/g, ' -')
                            }

                            if (key === 'description') {
                                if (newProduct.description) {
                                    newProduct.description = newProduct.description.replace(/http:\/\/stage\.hyzershop\.com\/product/g, '/shop/product')
                                    newProduct.description = newProduct.description.replace(/https:\/\/hyzershop\.com\/product/g, '/shop/product')
                                    newProduct.description = newProduct.description.replace(/https:\/\/www\.hyzershop\.com\/product/g, '/shop/product')
                                    newProduct.description = newProduct.description.replace(/Š—È/g, '\'')
                                    newProduct.description = newProduct.description.replace(/ŠÜ¢/g, ' –')
                                    newProduct.description = newProduct.description.replace('<div class="longdescription">', '\n')
                                    newProduct.description = newProduct.description.replace('</div>', '')
                                    newProduct.description = newProduct.description.replace(/Î¾/g, ' ')
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
                    // [ EXCEPTION ]
                    // !!!!!!!!!!!!!!!!!!

                    const sku = newProduct.sku
                    if (sku === 'METEOR_GLOZ_1769') {
                        if (newProducts.find((p) => p.sku === 'METEOR_GLOZ_1769')) {
                            newProduct.sku = 'METEOR_GLOZ_1769_2'
                        }
                    }
                    if (!!sku.match(/HORNET_/)) {
                        newProduct.parentSku = 'HORNET'
                    }

                    /////////////////////

                    newProduct.variableAttributes = variableAttributeIds
                    newProduct.variableAttributeValues = variableAttributeValueIds
                    newProduct.attributeValues = attributeValueIds
                    newProduct.simpleAttributeValues = simpleAttributeValues
                    newProduct.taxonomyTerms = taxonomyTermIds

                    delete (<any>newProduct).images
                    delete (<any>newProduct).featuredImage
                    delete (<any>newProduct).thumbnail

                    newProducts.push(newProduct)
                }
            }

            try {
                console.log('Building products...')
                await buildProducts()
                console.log('Products built!')
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
                return
            }

            /*************
             * The switch
             ******* -> */
            try {
                console.log('Creating products...')
                const allProducts = await this.dbClient.create<Product>(Product, newProducts)
                console.log('Products created!')
                const parentProducts = allProducts.filter((p) => p.isParent)
                const variationProducts = allProducts.filter((p) => p.isVariation)

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
                    product.images = []

                    if (!product.isParent) {
                        let isDisc: boolean
                        let attributeValues: AttributeValue[]
                        let taxonomyTerms: TaxonomyTerm[]
                        let imageBaseUrl = `/product-images/`

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
                            attributeValues = await this.dbClient.findIds(AttributeValue, new ListFromIdsRequest({ ids: product.attributeValues })) as AttributeValue[]
                            taxonomyTerms = await this.dbClient.findIds(TaxonomyTerm, new ListFromIdsRequest({ ids: product.taxonomyTerms }))
                            isDisc = taxonomyTerms && taxonomyTerms.some((taxTerm) => taxTerm.slug === 'product-type-discs')
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

                        // Populate images for non-disc products.

                        imageBaseUrl.replace(/\-\-/g, '-')
                        imageBaseUrl.replace(/\-$/, '-')
                        if (product.sku === 'DISCRAFTSTARTER') {
                            imageBaseUrl = '/product-images/discraft-disc-golf-set'
                        }
                        if (product.sku === 'DISCRAFTDELUXE') {
                            imageBaseUrl = '/product-images/discraft-deluxe-disc-golf-set'
                        }
                        if (product.sku === 'BLACKHOLE_PRO') {
                            imageBaseUrl = '/product-images/discraft-deluxe-disc-golf-set'
                        }
                        if (product.sku === 'BLACKHOLE_PRECISION') {
                            imageBaseUrl = '/product-images/discraft-deluxe-disc-golf-set'
                        }
                        if (product.sku === 'BLACKHOLE_PRACTICE') {
                            imageBaseUrl = '/product-images/discraft-deluxe-disc-golf-set'
                        }

                        const productImage: Image = {
                            large: imageBaseUrl + '-large.png',
                            medium: imageBaseUrl + '-medium.png',
                            thumbnail: imageBaseUrl + '-thumbnail.png',
                        }

                        product.featuredImages.push(productImage)
                        product.images.push(productImage)
                    }

                    await product.save()
                    console.log('Product images saved')
                }

                // Populate parent product images with variation images.

                for (let i = 0; i < parentProducts.length; i++) {
                    const product = parentProducts[i]
                    let variations = []
                    if (product.isParent) {
                        variations = allProducts.filter(p => product.sku === p.parentSku)
                        variations.forEach((pv) => {
                            product.featuredImages = product.featuredImages.concat(pv.featuredImages)
                            product.images = product.images.concat(pv.images)
                        })
                    }

                    await product.save()
                    console.log('Parent images saved')
                }

                // Populate parent products with variation attributes and attribute values.

                for (let i = 0; i < variationProducts.length; i++) {
                    const variation = variationProducts[i]
                    const parent = parentProducts.find((p) => p.sku === variation.parentSku)

                    if (!parent) {
                        throw new Error(`Could not find a parent for the product variation: ${JSON.stringify(variation)}`)
                    }

                    // Add the parent to the variation.
                    variation.parent = parent._id

                    if (!parent.variableAttributes) {
                        parent.variableAttributes = []
                    }
                    if (!parent.variableAttributeValues) {
                        parent.variableAttributeValues = []
                    }

                    variation.variableAttributes.forEach((attrId) => {
                        if (!parent.variableAttributes.find((parentAttrId) => parentAttrId === attrId)) {
                            parent.variableAttributes.push(attrId)
                        }
                    })

                    variation.variableAttributeValues.forEach((attrValueId) => {
                        if (!parent.variableAttributeValues.find((parentAttrValueId) => parentAttrValueId === attrValueId)) {
                            parent.variableAttributeValues.push(attrValueId)
                        }
                    })

                    variation.variableAttributes = []
                    variation.variableAttributeValues = []

                    await variation.save()
                    await parent.save()
                    console.log('Variation attributes and attribute values added')
                }

                // Fill out taxonomy terms.

                const discTypes = [
                    'disc-type-putters',
                    'disc-type-mid-ranges',
                    'disc-type-fairway-drivers',
                    'disc-type-distance-drivers',
                ]

                for (let i = 0; i < discTypes.length; i++) {
                    const slug = discTypes[i]
                    const discType = await this.dbClient.findOne(TaxonomyTerm, { slug })
                    const partialSlug = slug.replace('disc-type-', '')
                    const name = titleize(partialSlug.replace(/-/g, ' '))
                    const singularName = singularize(name)
                    const pluralName = pluralize(name)

                    await this.dbClient.updateById(TaxonomyTerm, discType._id, {
                        singularName,
                        pluralName,
                        pageSettings: {
                            banner: `/page-images/${partialSlug}-banner.jpg`,
                            bannerOverlay: `/page-images/${slug}.png`,
                        },
                    })
                    console.log('Disc type hydrated: ' + slug)
                }

                const brands = [
                    'brand-mvp-disc-sports',
                    'brand-axiom-discs',
                    'brand-discraft',
                ]

                for (let i = 0; i < brands.length; i++) {
                    const slug = brands[i]
                    const brand = await this.dbClient.findOne(TaxonomyTerm, { slug })
                    const partialSlug = slug.replace('brand-', '')
                    let brandName = titleize(partialSlug.substring(0, partialSlug.indexOf('-')))
                    let name = titleize(partialSlug.replace(/-/g, ' '))
                    if (slug === 'brand-mvp-disc-sports') {
                        brandName = 'MVP Disc Sports'
                        name = 'MVP'
                    }
                    const singularName = singularize(name)
                    const pluralName = `${brandName} Discs`

                    await this.dbClient.updateById(TaxonomyTerm, brand._id, {
                        singularName,
                        pluralName,
                        pageSettings: {
                            banner: `/page-images/${partialSlug}-banner.jpg`,
                            bannerOverlay: `/page-images/${slug}.png`,
                        },
                    })
                    console.log('Brand hydrated: ' + slug)
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
