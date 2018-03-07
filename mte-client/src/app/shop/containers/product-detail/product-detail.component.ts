import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/takeWhile'

import { Attribute } from '@mte/common/models/api-models/attribute'
import { AttributeValue } from '@mte/common/models/api-models/attribute-value'
import { Product } from '@mte/common/models/api-models/product'
import { CartService } from '../../../shared/services/cart.service'
import { ProductService } from '../../services/product.service'

// TODO:
// - Set 'max' on number input for `quantity` equal to the number of standalones/variations in stock

@Component({
    selector: 'mte-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
    private isAlive = false

    // This represents the product that is displayed when the view
    // is loaded.
    public parentOrStandalone: Product

    // This represents any variations associated with the product,
    // if the product is a Parent.
    public variations: Product[]

    // This represents the product that will be added to the cart.
    // Should be `null` if no product is ready to be added, e.g. if
    // a variation has yet to be selected.
    public selectedProduct: Product

    public quantityToAdd: number

    public variableAttributeOptions: { [key: string]: any[] } = {}

    constructor(
        private activatedRoute: ActivatedRoute,
        private cartService: CartService,
        private productService: ProductService,
    ) { console.log(this) }

    public ngOnInit(): void {
        this.isAlive = true
        this.activatedRoute.params
            .switchMap((params: { slug: string }) => {
                setTimeout(() => this.productService.getDetail(params.slug))
                return this.productService.getDetails
            })
            .takeWhile(() => this.isAlive)
            .subscribe((responseBody) => {
                this.parentOrStandalone = responseBody
                this.variations = this.parentOrStandalone.variations as Product[]
                if (!this.hasVariations()) {
                    this.selectedProduct = this.parentOrStandalone
                }
                this.populateAttributeSelections()

                console.log(this.parentOrStandalone)
            })
    }

    public ngOnDestroy(): void {
        this.isAlive = false
    }

    public addToCart(): void {
        if (!this.selectedProduct) return
        this.cartService.add(this.selectedProduct.slug, this.quantityToAdd)
    }

    private populateAttributeSelections(): void {
        if (!this.hasVariations() || !this.parentOrStandalone.variableAttributes) return

        this.parentOrStandalone.variableAttributes.forEach((variableAttribute: Attribute) => {
            this.variableAttributeOptions[variableAttribute.slug] = [] as any[]
        })

        this.variations.forEach((variation) => {
            if (variation.attributeValues) {
                variation.attributeValues.forEach((variationAttributeValue: AttributeValue) => {
                    if (this.variableAttributeOptions[(variationAttributeValue.attribute as Attribute).slug]) {
                        this.variableAttributeOptions[(variationAttributeValue.attribute as Attribute).slug].push(
                            variationAttributeValue
                        )
                    }
                })
            }
        })

        console.log('[ProductDetailComponent] Attribute selection:', this.variableAttributeOptions)
    }

    private hasVariations(): boolean {
        return this.variations != null && this.variations.length > 0
    }
}
