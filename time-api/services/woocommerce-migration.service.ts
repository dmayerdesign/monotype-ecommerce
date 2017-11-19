import { injectable } from 'inversify'

import { CurrencyEnum } from '@time/common/constants'

import { Attribute, AttributeModel } from '@time/common/models/api-models/attribute'
import { AttributeValue, AttributeValueModel } from '@time/common/models/api-models/attribute-value'
import { Product, ProductModel } from '@time/common/models/api-models/product'
import { Taxonomy, TaxonomyModel } from '@time/common/models/api-models/taxonomy'
import { TaxonomyTerm, TaxonomyTermModel } from '@time/common/models/api-models/taxonomy-term'
import * as productsJSON from '@time/common/work-files/migration/hyzershop-products'

@injectable()
export class WoocommerceMigrationService {

    public createProductsFromExportedJSON(appConfig): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const newProducts = []

            async function createProducts() {
                let product: any
                for (product of productsJSON) {
                    const newProduct: Product = Object.assign({}, product)

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
                        if (typeof newProduct[key] !== "undefined" && newProduct[key] !== undefined && newProduct[key] !== "") {

                            if (key.indexOf("attributes.") > -1) {
                                const theKey = key.replace("attributes.", "")
                                if (product.class === "Variable" && product[key] && product[key].indexOf("|") > -1) {
                                    const value = product[key]
                                    const variableAttributeValueSlugs = product[key].split("|").map(val => val.replace(/\s/g, "-").toLowerCase())
                                    const variableAttributeSlug = theKey
                                    try {
                                        const variableAttributeResponse = await AttributeModel.findOrCreate<Attribute>({
                                            slug: variableAttributeSlug
                                        })
                                        const variableAttribute = variableAttributeResponse.doc
                                        for (const variableAttributeValueSlug of variableAttributeValueSlugs) {
                                            try {
                                                const variableAttributeValueResponse = await AttributeValueModel.findOrCreate<AttributeValue>({
                                                    attribute: variableAttribute._id,
                                                    slug: variableAttributeValueSlug,
                                                    value,
                                                })
                                                const variableAttributeValue = variableAttributeValueResponse.doc
                                                variableAttributeValueIds.push(variableAttributeValue._id)
                                            }
                                            catch (error) {
                                                reject(error)
                                            }
                                        }
                                    }
                                    catch (error) {
                                        reject(error)
                                        return
                                    }
                                }
                                else {
                                    const value = product[key]
                                    const attributeValueSlug = theKey + "-" + product[key].replace(/\s/g, "-").toLowerCase()
                                    const attributeSlug = theKey
                                    try {
                                        const attributeResponse = await AttributeModel.findOrCreate<Attribute>({
                                            slug: attributeSlug
                                        })
                                        const attribute = attributeResponse.doc
                                        const attributeValueResponse = await AttributeValueModel.findOrCreate<AttributeValue>({
                                            attribute: attribute._id,
                                            slug: attributeValueSlug,
                                            value,
                                        })
                                        const attributeValue = attributeValueResponse.doc
                                        attributeValueIds.push(attributeValue._id)
                                        delete newProduct[key]
                                    }
                                    catch (error) {
                                        reject(error)
                                        return
                                    }
                                }

                                if (theKey === "fade" || theKey === "glide" || theKey === "turn" || theKey === "speed") {
                                    flightStats[theKey] = product[key]

                                    const stability = function(stabilityStats): 'overstable'|'stable'|'understable' {
                                        if ( stabilityStats.fade + stabilityStats.turn >= 3 ) {
                                            return "overstable"
                                        }
                                        else if ( stabilityStats.fade + stabilityStats.turn < 3 && stabilityStats.fade + stabilityStats.turn >= 0 ) {
                                            return "stable"
                                        }
                                        else if ( stabilityStats.fade + stabilityStats.turn < 0 ) {
                                            return "understable"
                                        }
                                    }

                                    if (Object.keys(flightStats).every(statKey => flightStats[statKey] !== undefined)) {
                                        try {
                                            const stabilityValue = stability(flightStats)
                                            const attributeSlug = 'stability'
                                            const taxonomySlug = 'stability'
                                            const attributeValueSlug = attributeSlug + "-" + stabilityValue
                                            const taxonomyTermSlug = taxonomySlug + "-" + stabilityValue

                                            const attributeResponse = await AttributeModel.findOrCreate<Attribute>({
                                                slug: attributeSlug,
                                            })
                                            const attribute = attributeResponse.doc
                                            const attributeValueResponse = await AttributeValueModel.findOrCreate<AttributeValue>({
                                                attribute: attribute._id,
                                                slug: attributeValueSlug,
                                                value: stabilityValue,
                                            })
                                            const attributeValue = attributeValueResponse.doc
                                            attributeValueIds.push(attributeValue._id)

                                            const taxonomyResponse = await TaxonomyModel.findOrCreate<Taxonomy>({
                                                slug: taxonomySlug,
                                            })
                                            const taxonomy = taxonomyResponse.doc
                                            const taxonomyTermResponse = await TaxonomyTermModel.findOrCreate<TaxonomyTerm>({
                                                taxonomy: taxonomy._id,
                                                slug: taxonomyTermSlug,
                                            })
                                            const taxonomyTerm = taxonomyTermResponse.doc
                                            taxonomyTermIds.push(taxonomyTerm._id)
                                        }
                                        catch (error) {
                                            reject(error)
                                            return
                                        }
                                    }
                                }
                            }
                            if (key.indexOf("taxonomies.") > -1) {
                                const taxonomySlug = key.replace("taxonomies.", "")
                                const taxonomyTermSlug = key.replace("taxonomies.", "") + "-" + product[key].replace(/\s/g, "-").toLowerCase()
                                try {
                                    const taxonomyResponse = await TaxonomyModel.findOrCreate<Taxonomy>({ slug: taxonomySlug })
                                    const taxonomy = taxonomyResponse.doc
                                    const taxonomyTermResponse = await TaxonomyTermModel.findOrCreate<TaxonomyTerm>({
                                        taxonomy: taxonomy._id,
                                        slug: taxonomyTermSlug
                                    })
                                    const taxonomyTerm = taxonomyTermResponse.doc
                                    taxonomyTermIds.push(taxonomyTerm._id)
                                    delete newProduct[key]
                                }
                                catch (error) {
                                    reject(error)
                                    return
                                }
                            }
                            if (key === "netWeight") {
                                newProduct[key] = (<any>newProduct[key]).replace(/g/g, "")
                                if ( (<any>newProduct[key]).indexOf("|") > -1 ) {
                                    delete newProduct[key]
                                }
                            }
                            if (key === "price") {
                                if ( newProduct[key].toString().indexOf("-") > -1 ) {
                                    const priceRangeTotals = (<any>newProduct[key]).split("-")
                                    newProduct.priceRange = [
                                        {
                                            total: 0,
                                            currency: CurrencyEnum.USD,
                                        },
                                        {
                                            total: 0,
                                            currency: CurrencyEnum.USD,
                                        },
                                    ]
                                    newProduct.priceRange[0].total = parseInt(priceRangeTotals[0].total, 10)
                                    newProduct.priceRange[1].total = parseInt(priceRangeTotals[1].total, 10)
                                    delete newProduct[key]
                                }
                                else {
                                    newProduct[key] = {
                                        total: +newProduct[key],
                                        currency: CurrencyEnum.USD
                                    }
                                }
                            }
                            if (key === "salePrice") {
                                if ( newProduct[key].toString().indexOf("-") > -1 ) {
                                    const salePriceRangeTotals = (<any>newProduct[key]).split("-")
                                    newProduct.salePriceRange = [
                                        {
                                            total: 0,
                                            currency: CurrencyEnum.USD,
                                        },
                                        {
                                            total: 0,
                                            currency: CurrencyEnum.USD,
                                        },
                                    ]
                                    newProduct.salePriceRange[0].total = parseInt(salePriceRangeTotals[0].total, 10)
                                    newProduct.salePriceRange[1].total = parseInt(salePriceRangeTotals[1].total, 10)
                                    delete newProduct[key]
                                }
                                else {
                                    newProduct[key] = {
                                        total: +newProduct[key],
                                        currency: CurrencyEnum.USD
                                    }
                                }
                            }

                            if (key === "class") {
                                if ((<string>newProduct.class) === "Variable") {
                                    newProduct.isParent = true
                                    newProduct.class = "parent"
                                }
                                if ((<string>newProduct.class) === "Variation") {
                                    newProduct.isVariation = true
                                    newProduct.class = "variation"
                                }
                                if ((<string>newProduct.class) === "Simple Product") {
                                    newProduct.isStandalone = true
                                    newProduct.class = "standalone"
                                }
                            }

                            if (key === "description") {
                                if (newProduct.description) {
                                    newProduct.description = newProduct.description.replace(/http:\/\/stage\.hyzershop\.com\/product/g, '/shop/product')
                                    newProduct.description = newProduct.description.replace(/Š—È/g, '\'')
                                    newProduct.description = newProduct.description.replace('<div class="longdescription">', '\n')
                                    newProduct.description = newProduct.description.replace('</div>', '')
                                }
                            }
                        }
                        else {
                            delete newProduct[key]
                        }
                    }

                    newProduct.variableAttributes = variableAttributeIds
                    newProduct.variableAttributeValues = variableAttributeValueIds
                    newProduct.attributeValues = attributeValueIds
                    newProduct.taxonomyTerms = taxonomyTermIds

                    delete (<any>newProduct).featuredImage

                    /**
                     * Add images
                     */
                    if (!newProduct.isParent) {
                        let isDisc: boolean
                        let attributeValues: AttributeValue[]
                        let imageBaseUrl = `${appConfig.cloudfront_url}/product-images/`
                        newProduct.taxonomyTermSlugs.forEach(term => {
                            if (term.indexOf("brand") === 0) {
                                if (term.indexOf("MVP") > -1) {
                                    imageBaseUrl += "mvp-"
                                }
                                if (term.indexOf("Axiom") > -1) {
                                    imageBaseUrl += "axiom-"
                                }
                                if (term.indexOf("Discraft") > -1) {
                                    imageBaseUrl += "discraft-"
                                }
                            }
                        })

                        try {
                            attributeValues = await AttributeValueModel.find({ _id: { $in: newProduct.attributeValues } })
                            isDisc = attributeValues.some(attrValue => attrValue.slug === "product-type-disc")
                        }
                        catch (err) {
                            reject(err)
                            return
                        }

                        if (newProduct.parentSKU && newProduct.isVariation) imageBaseUrl += `${newProduct.parentSKU.toLowerCase()}-`
                        else if (newProduct.SKU) imageBaseUrl += `${newProduct.SKU.toLowerCase()}-`

                        if (isDisc) {
                            for (const attributeValueId of newProduct.attributeValues) {
                                const attributeValue = attributeValues.find(val => val._id === attributeValueId)
                                if (attributeValue.slug.indexOf("plastic") > -1) {
                                    imageBaseUrl += `${attributeValue.value.toLowerCase()}-`
                                }
                            }
                            imageBaseUrl += newProduct.netWeight.toString().replace(".", "")
                        } else {
                            for (const attributeValueId of newProduct.attributeValues) {
                                const attributeValue = attributeValues.find(val => val._id === attributeValueId)
                                if (attributeValue.slug.indexOf("color") > -1) {
                                    imageBaseUrl += `${attributeValue.value.toLowerCase()}-`
                                }
                            }
                        }

                        newProduct.featuredImages = []
                        newProduct.largeImages = []
                        newProduct.images = []
                        newProduct.thumbnails = []

                        newProduct.featuredImages.push(imageBaseUrl + "-medium.png")
                        newProduct.largeImages.push(imageBaseUrl + "-large.png")
                        newProduct.thumbnails.push(imageBaseUrl + "-thumbnail.png")
                    } else {
                        newProduct.featuredImages = []
                        newProduct.largeImages = []
                        newProduct.images = []
                        newProduct.thumbnails = []
                    }
                    delete (<any>newProduct).thumbnail

                    newProducts.push(newProduct)
                }
            }

            createProducts()

            newProducts.forEach((product, index, products) => {
                let variations = []
                if (product.isParent) {
                    variations = products.filter(p => product.SKU === p.parentSKU)
                    variations.forEach(pv => {
                        products[index].images = products[index].images.concat(pv.images)
                        products[index].featuredImages = products[index].featuredImages.concat(pv.featuredImages)
                        products[index].largeImages = products[index].largeImages.concat(pv.largeImages)
                        products[index].thumbnails = products[index].thumbnails.concat(pv.thumbnails)
                    })
                }
            })

            /*************
             * The switch
             ******* -> */
            ProductModel.create(newProducts)
                .then(products => resolve(products))
                .catch(err => reject(err))
            /**/
        })
    }
}
