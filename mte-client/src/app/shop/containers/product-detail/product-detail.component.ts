import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { switchMap, takeWhile } from 'rxjs/operators'

import { CustomRegionsHelper } from '@mte/common/helpers/custom-regions.helper'
import { ProductHelper } from '@mte/common/helpers/product.helper'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { Attribute } from '@mte/common/models/api-models/attribute'
import { AttributeValue } from '@mte/common/models/api-models/attribute-value'
import { CustomRegions } from '@mte/common/models/api-models/custom-regions'
import { Product } from '@mte/common/models/api-models/product'
import { TaxonomyTerm } from '@mte/common/models/api-models/taxonomy-term'
import { GetAttributeSelectOptionsResponseBody } from '@mte/common/models/api-responses/get-attribute-select-options/get-attribute-select-options.response.body'
import { CartService } from '../../../shared/services/cart.service'
import { OrganizationService } from '../../../shared/services/organization.service'
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
                    <span [ngClass]="[
                        'product-detail-info--brand',
                        'ff-display-2 h3 text-uppercase'
                    ]">{{ brandName }}</span>
                    <h1 class="product-detail-info--name">{{ productName }}</h1>

                    <!-- Custom regions -->
                    <ng-container *ngFor="let region of customRegions.productDetailInfoHeader; let i = index">
                        <div [ngClass]="[
                                ('product-detail-info--header-custom-region' + i),
                                (region.className || '')
                            ]"
                            [innerHTML]="customRegionsHelper.getCustomRegionHtml(region, parentOrStandalone)">
                        </div>
                        <br>
                    </ng-container>
                </header>

                <div class="product-detail-info--price">
                    {{ productHelper.getPriceString(parentOrStandalone) }}
                </div>

                <div class="product-detail-info--description"
                     [innerHTML]="parentOrStandalone.description">
                </div>

                <div class="product-detail-info--variable-attributes">
                    <div *ngFor="let variableAttrAndOptions of productHelper.getVariableAttributesAndOptions(parentOrStandalone)">
                        <div class="product-detail-info--variable-attributes--name">
                            {{ variableAttrAndOptions.attribute?.name || variableAttrAndOptions.attribute?.slug }}
                        </div>
                        <select>
                            <option *ngFor="let attributeValue of variableAttrAndOptions.attributeValues">{{ attributeValue?.name || attributeValue?.slug }}</option>
                        </select>
                    </div>
                </div>

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
    styleUrls: ['./product-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
@Heartbeat()
export class ProductDetailComponent extends HeartbeatComponent implements OnInit, OnDestroy {
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

    public customRegions: CustomRegions
    // = {
    //     productDetailInfoHeader: [{
    //         apiModel: 'Product',
    //         dataArrayProperty: 'taxonomyTerms',
    //         pathToDataArrayPropertyLookupKey: 'taxonomy.slug',
    //         dataArrayPropertyLookupValue: 'disc-type',
    //         pathToDataPropertyValue: 'singularName',
    //     }],
    // }

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
        'page-container',
        'container',
    ]

    // Helpers.

    public customRegionsHelper = CustomRegionsHelper
    public productHelper = ProductHelper

    constructor(
        private activatedRoute: ActivatedRoute,
        private cartService: CartService,
        private productService: ProductService,
        private organizationService: OrganizationService,
    ) {
        super()
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

        this.organizationService.organizations.subscribe((organization) => {
            this.customRegions = organization.storeUiContent.customRegions
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
