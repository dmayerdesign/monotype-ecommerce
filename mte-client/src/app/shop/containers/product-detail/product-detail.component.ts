import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { switchMap, takeWhile } from 'rxjs/operators'

import { CustomRegionsHelper } from '@mte/common/helpers/custom-regions.helper'
import { ProductHelper } from '@mte/common/helpers/product.helper'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { Attribute } from '@mte/common/models/api-models/attribute'
import { AttributeValue } from '@mte/common/models/api-models/attribute-value'
import { CustomRegions } from '@mte/common/models/api-models/custom-regions'
import { Product } from '@mte/common/models/api-models/product'
import { TaxonomyTerm } from '@mte/common/models/api-models/taxonomy-term'
import { GetAttributeSelectOptionsResponseBody } from '@mte/common/models/api-responses/get-attribute-select-options/get-attribute-select-options.response.body'
import { CartService } from '../../../shared/services/cart.service'
import { ProductService } from '../../services/product.service'

@Component({
    selector: 'mte-product-detail',
    template: `
    <div *ngIf="selectedProduct"
         [ngClass]="productDetailContainerClassList">

        <div class="product-detail-main row">
            <div [ngClass]="productDetailImagesClassList">
                <mte-product-image
                    [src]="getMainImage()"
                    [hasMagnifier]="true">
                </mte-product-image>
            </div>
            <div [ngClass]="productDetailInfoClassList">
                <header>
                    <span class="product-detail-info--brand">{{ brandName }}</span>
                    <h1 class="product-detail-info--name">{{ productName }}</h1>

                    <!-- Custom regions -->
                    <span *ngFor="let region of customRegions.productDetailInfoHeader; let i = index"
                        [ngClass]="[
                            ('product-detail-info--header-custom-region' + i),
                            (region.className || '')
                        ]">
                        {{ customRegionsHelper.getCustomRegionTextValueFromArrayProperty(region, parentOrStandalone) }}
                    </span>
                </header>

                <mte-form-field [options]="{
                        label: 'Quantity'
                    }">
                    <input #input
                        id="add-to-cart-form--quantity-to-add"
                        type="number"
                        [disabled]="!selectedProduct"
                        [attr.max]="quantityInputMax"
                        [attr.min]="0"
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
    public quantityToAdd = 1
    public attributeSelections: GetAttributeSelectOptionsResponseBody = []

    // Custom regions. TODO: Get these from the database.

    public customRegions: CustomRegions = {
        productDetailInfoHeader: [{
            apiModel: 'Product',
            dataArrayProperty: 'taxonomyTerms',
            pathToDataArrayPropertyLookupKey: 'taxonomy.slug',
            dataArrayPropertyLookupValue: 'disc-type',
            pathToDataPropertyValue: 'singularName',
        }],
    }

    // CSS classes.

    public productDetailImagesClassList = [
        'product-detail-images',
        'col-sm-4',
        'pl-0',
        'pr-5',
    ]
    public productDetailInfoClassList = [
        'product-detail-info',
        'col-sm-8',
    ]
    public productDetailContainerClassList = [
        'product-detail',
        'container',
        'pt-5',
    ]

    // Helpers.

    public customRegionsHelper = CustomRegionsHelper

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

    public get brandName(): string {
        const brand = ProductHelper.getBrand(this.parentOrStandalone)
        return brand ? brand.singularName : ''
    }

    public get productName(): string {
        return this.parentOrStandalone.name
    }

    public get quantityInputMax(): number {
        return this.selectedProduct && typeof this.selectedProduct.stockQuantity !== 'undefined'
            ? this.selectedProduct.stockQuantity
            : 1
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
