import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { switchMap, takeWhile } from 'rxjs/operators'

import { ProductHelper } from '@mte/common/helpers/product.helper'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { Attribute } from '@mte/common/models/api-models/attribute'
import { AttributeValue } from '@mte/common/models/api-models/attribute-value'
import { Product } from '@mte/common/models/api-models/product'
import { TaxonomyTerm } from '@mte/common/models/api-models/taxonomy-term'
import { GetAttributeSelectOptionsResponseBody } from '@mte/common/models/api-responses/get-attribute-select-options/get-attribute-select-options.response.body'
import { CartService } from '../../../shared/services/cart.service'
import { ProductService } from '../../services/product.service'

@Component({
    selector: 'mte-product-detail',
    template: `
    <div *ngIf="selectedProduct"
         class="product-detail container">

        <div class="product-detail-main">
            <div class="product-detail-images">
                <mte-product-image
                    [src]="getMainImage()"
                    [hasMagnifier]="true">
                </mte-product-image>
            </div>
            <div class="product-detail-info">
                <span class="product-detail-info-brand">{{ brand?.singularName }}</span>
                <mte-form-field [options]="{
                        label: 'Quantity'
                    }">
                    <input #input
                        id="add-to-cart-form--quantity-to-add"
                        type="number"
                        [attr.max]="(selectedProduct ? selectedProduct.stockQuantity : 1)"
                        [(ngModel)]="quantityToAdd">
                </mte-form-field>
            </div>
        </div>
    </div>
    `,
    styleUrls: ['./product-detail.component.scss']
})
@Heartbeat()
export class ProductDetailComponent implements OnInit, OnDestroy {
    private isAlive = false

    /**
     * Represents the product that is displayed when the view
     * is loaded.
     */
    public parentOrStandalone: Product

    /**
     * Represents any variations associated with the product,
     * if the product is a Parent.
     */
    public variations: Product[]

    /**
     * Represents the product that will be added to the cart.
     */
    public selectedProduct: Product

    public quantityToAdd: number

    public attributeSelections: GetAttributeSelectOptionsResponseBody = []

    constructor(
        private activatedRoute: ActivatedRoute,
        private cartService: CartService,
        private productService: ProductService,
    ) {
        console.log(this)
    }

    // Lifecycle methods.

    public ngOnInit(): void {
        this.activatedRoute.params
            .pipe(
                switchMap((params: { slug: string }) => {
                    setTimeout(() => this.productService.getDetail(params.slug))
                    return this.productService.getDetails
                }),
                takeWhile(() => this.isAlive)
            )
            .subscribe((responseBody) => {
                this.parentOrStandalone = responseBody
                this.variations = this.parentOrStandalone.variations as Product[]
                this.populateAttributeSelectOptions()
                this.populateSelectedProduct()
            })
    }

    public ngOnDestroy(): void { }

    // Init methods.

    private populateAttributeSelectOptions(): void {

        // But only if it's a variable product, of course.
        if (!this.hasVariations() || !this.parentOrStandalone.variableAttributes) return

        this.productService.getAttributeSelectOptionss.subscribe((attributeSelectionData) => {
            this.attributeSelections = attributeSelectionData
        })
        this.productService.getAttributeSelectOptions(this.parentOrStandalone.slug)
    }

    private populateSelectedProduct(): void {

        // If it's variable, set the default variation as the selected product.
        if (this.hasVariations()) {
            this.selectedProduct = this.variations.find((p) => p.isDefaultVariation)

            // If there's no default variation, just choose the first one.
            if (!this.selectedProduct) {
                this.selectedProduct = this.variations[0]
            }
        }
        else {
            this.selectedProduct = this.parentOrStandalone
        }
    }

    public getMainImage(): string {
        if (this.selectedProduct) {
            if (this.selectedProduct.featuredImages[0]) {
                return this.selectedProduct.featuredImages[0].medium
            } else {
                return this.selectedProduct.images[0].medium
            }
        } else {
            if (this.parentOrStandalone.featuredImages[0]) {
                return this.parentOrStandalone.featuredImages[0].medium
            } else {
                return this.parentOrStandalone.images[0].medium
            }
        }
    }

    // Template bindings.

    public get brand(): TaxonomyTerm {
        return ProductHelper.getBrand(this.parentOrStandalone)
    }

    // Booleans.

    private hasVariations(): boolean {
        return this.variations != null && this.variations.length > 0
    }

    // Interactions.

    public addToCart(): void {
        if (!this.selectedProduct) return
        this.cartService.add(this.selectedProduct.slug, this.quantityToAdd)
    }
}
