import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { startCase } from 'lodash'
import { switchMap, takeWhile, filter, map, delay, tap } from 'rxjs/operators'

import { CartHelper } from '@mte/common/helpers/cart.helper'
import { CustomRegionsHelper } from '@mte/common/helpers/custom-regions.helper'
import { ProductHelper } from '@mte/common/helpers/product.helper'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { Attribute } from '@mte/common/models/api-models/attribute'
import { AttributeValue } from '@mte/common/models/api-models/attribute-value'
import { CustomRegions } from '@mte/common/models/api-models/custom-regions'
import { Organization } from '@mte/common/models/api-models/organization'
import { Product } from '@mte/common/models/api-models/product'
import { TaxonomyTerm } from '@mte/common/models/api-models/taxonomy-term'
import { VariableAttributesAndOptions } from '@mte/common/models/interfaces/common/variable-attributes-and-options'
import { CartService } from '../../../shared/services/cart/cart.service'
import { OrganizationService } from '../../../shared/services/organization.service'
import { UiService } from '../../../shared/services/ui.service'
import { ProductService } from '../../services/product.service'
import { SimpleAttributeValue } from '@mte/common/models/api-models/simple-attribute-value';
import { Subscription } from 'rxjs';

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
                <header class="product-detail-info--header">
                    <span [ngClass]="[
                        'product-detail-info--brand',
                        'ff-display-2 h3 text-uppercase'
                    ]">{{ brandName }}</span>
                    <h1 class="product-detail-info--name">{{ productName }}</h1>

                    <!-- Custom regions: productDetailInfoHeader -->
                    <div class="product-detail-info--header-custom-regions">
                        <ng-container *ngFor="let region of customRegions.productDetailInfoHeader; let i = index">
                            <ng-container *ngIf="customRegionsHelper.hasDataForCustomRegion(region, parentOrStandalone)">
                                <div [ngClass]="[
                                        ('product-detail-info--header-custom-region-' + i),
                                        (region.className || '')
                                    ]"
                                    [innerHTML]="customRegionsHelper.getCustomRegionHtml(region, parentOrStandalone)">
                                </div>
                                <br>
                            </ng-container>
                        </ng-container>
                    </div>
                </header>

                <div class="product-detail-info--price">
                    {{ productHelper.getPriceString(parentOrStandalone) }}
                </div>

                <p class="product-detail-info--description"
                    [innerHTML]="parentOrStandalone.description">
                </p>

                <div class="product-detail-info--variable-attributes">
                    <form *ngIf="variableAttributesFormDidInit"
                        [formGroup]="variableAttributesForm">
                        <div *ngFor="let variableAttrAndOptions of variableAttributesAndOptions">
                            <mte-form-field [options]="{
                                    label: getVariableAttributeLabel(variableAttrAndOptions),
                                    labelClass: 'product-detail-info--variable-attributes--name'
                                }">
                                <select #input
                                    [formControlName]="variableAttrAndOptions.attribute.slug">
                                    <option *ngFor="let attributeValue of variableAttrAndOptions.attributeValues"
                                        [ngValue]="attributeValue">
                                        {{ attributeValue?.name || attributeValue?.slug }}
                                        <ng-container *ngIf="attributeValueIsUnavailable(attributeValue)">
                                            (unavailable)
                                        </ng-container>
                                    </option>
                                </select>
                            </mte-form-field>
                        </div>
                    </form>
                </div>

                <div class="product-detail-add-to-cart">
                    <div class="product-detail-add-to-cart--quantity">
                        <mte-form-field [options]="{ label: 'Quantity', hideLabel: true }">
                            <input #input
                                id="add-to-cart--quantity-input"
                                type="number"
                                [disabled]="!selectedProduct"
                                [attr.max]="quantityInputMax"
                                [attr.min]="0"
                                [(ngModel)]="quantityToAdd">
                        </mte-form-field>
                    </div>
                    <div class="product-detail-add-to-cart--submit">
                        <button (click)="addToCart()"
                            [disabled]="addToCartShouldBeDisabled()">
                            Add to {{ organization.branding.cartName || 'cart' }}
                        </button>
                    </div>
                </div>

                <!-- Custom regions: productDetailMid -->
                <div class="product-detail-mid--custom-regions">
                    <ng-container *ngFor="let region of customRegions.productDetailMid; let i = index">
                        <ng-container *ngIf="customRegionsHelper.hasDataForCustomRegion(region, parentOrStandalone)">
                            <div [ngClass]="[
                                    ('product-detail-mid--custom-region-' + i),
                                    (region.className || '')
                                ]"
                                [innerHTML]="customRegionsHelper.getCustomRegionHtml(region, parentOrStandalone)">
                            </div>
                            <br>
                        </ng-container>
                    </ng-container>
                </div>
            </div>
        </div>
    </div>
    `,
    styleUrls: ['./product-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
@Heartbeat()
export class ProductDetailComponent extends HeartbeatComponent implements OnInit, OnDestroy {
    // State.

    public organization: Organization
    /**
     * Represents the product that is displayed when the view is loaded.
     */
    public parentOrStandalone: Product
    /**
     * Represents any variations associated with the product, if the product is a Parent.
     */
    public variations: Product[]
    /**
     * Represents the product that will be added to the cart.
     */
    public selectedProduct: Product
    /**
     * A list of product variations matching the currently-selected variable attribute values.
     */
    public possibleVariations: Product[]
    public quantityToAdd = 1
    public variableAttributesAndOptions: VariableAttributesAndOptions = []
    public variableAttributesForm: FormGroup
    public variableAttributesFormValue: any = {}
    public variableAttributesFormDidInit = false
    public variableAttributesFormIsInitializing = false
    public variableAttributesFormValueChangesDisposable: Subscription
    public addingToCart = false

    // Custom regions.

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
        private uiService: UiService,
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
                this.populateSelectedProduct()
                this.populateVariableAttributesAndOptions()
                this.subscribeToVariableAttributesFormChanges()
            })

        this.organizationService.organizations.subscribe((organization) => {
            this.organization = organization
            this.customRegions = CustomRegionsHelper.getActiveCustomRegions(this.organization.storeUiContent.customRegions)
        })
    }

    public ngOnDestroy(): void { }

    // Init methods.

    private subscribeToVariableAttributesFormChanges(): void {
        if (this.variableAttributesFormValueChangesDisposable) {
            this.variableAttributesFormValueChangesDisposable.unsubscribe()
        }
        this.variableAttributesFormValueChangesDisposable = this.variableAttributesForm.valueChanges
            .pipe(
                tap((value) => this.variableAttributesFormValue = value),
                filter((value) =>
                    !this.variableAttributesFormIsInitializing &&
                    this.hasVariations() &&
                    !!Object.keys(value).length),
                map((value) => Object.keys(value)
                    .filter((key) => !!value[key])
                    .map((key) => value[key]) as (AttributeValue | SimpleAttributeValue)[]
                )
            )
            .subscribe((values) => {
                this.possibleVariations = this.productService.getVariationsFromAttributeValues(this.parentOrStandalone, values)
                if (this.possibleVariations.length) {
                    this.selectedProduct = this.possibleVariations[0]
                }
            })
    }

    private populateVariableAttributesAndOptions(): void {
        this.variableAttributesFormIsInitializing = true

        // But only if it's a variable product, of course.
        if (!this.hasVariations() || !this.parentOrStandalone.variableAttributes) return

        const newVariableAttributesAndOptions = this.productHelper.getVariableAttributesAndOptions(this.parentOrStandalone)

        this.variableAttributesAndOptions = newVariableAttributesAndOptions

        // Build the form.
        this.variableAttributesForm = new FormGroup({})
        this.variableAttributesAndOptions
            .forEach(({ attribute, attributeValues }) => {
                this.variableAttributesForm.addControl(
                    attribute.slug,
                    new FormControl('')
                )
            })

        this.variableAttributesFormDidInit = true
        this.variableAttributesFormIsInitializing = false
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

        this.uiService.setTitle(ProductHelper.getName(this.parentOrStandalone))
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

    public getVariableAttributeLabel({ attribute }: { attribute: Attribute }): string {
        return startCase(attribute.singularName || attribute.slug)
    }

    // Booleans.

    private hasVariations(): boolean {
        return this.variations != null && this.variations.length > 0
    }

    public addToCartShouldBeDisabled(): boolean {
        return !this.selectedProduct
            || !this.quantityToAdd
            || this.addingToCart
            || !CartHelper.getNumberAvailableToAdd(this.cartService.cart, this.selectedProduct)
            || (this.hasVariations() && this.possibleVariations && this.possibleVariations.length > 1)
    }

    public attributeValueIsUnavailable(attributeValue: AttributeValue): boolean {
        if (!!this.variableAttributesForm) {
            const attributeFormControl = this.variableAttributesForm.get((attributeValue.attribute as Attribute).slug)
            if (attributeFormControl && !!attributeFormControl.value) {
                return false
            }
        }
        if (!this.possibleVariations) return false
        return this.possibleVariations.every((variation) => {
            return !variation.attributeValues.find((attrValue) => {
                const attrValueId = (typeof attrValue === 'string') ? attrValue : attrValue._id
                return attrValueId === attributeValue._id
            })
        })
    }

    // Interactions.

    public addToCart(): void {
        if (!this.selectedProduct) return
        this.addingToCart = true
        this.cartService.add(this.selectedProduct.slug, this.quantityToAdd)
            .subscribe(() => this.addingToCart = false)
    }
}
