import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { CartHelper } from '@mte/common/helpers/cart.helper'
import { CustomRegionsHelper } from '@mte/common/helpers/custom-regions.helper'
import { ProductHelper } from '@mte/common/helpers/product.helper'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { CustomRegions } from '@mte/common/models/api-interfaces/custom-regions'
import { Organization } from '@mte/common/models/api-interfaces/organization'
import { Product } from '@mte/common/models/api-interfaces/product'
import { switchMap, takeWhile } from 'rxjs/operators'
import { CartService } from '../../../shared/services/cart/cart.service'
import { OrganizationService } from '../../../shared/services/organization.service'
import { UiService } from '../../../shared/services/ui.service'
import { ProductService } from '../../services/product.service'

@Component({
    selector: 'mte-product-detail',
    template: `
    <div *ngIf="displayedProduct"
        [ngClass]="[
            'product-detail',
            'page-container',
            'container'
        ]">

        <div class="product-detail-main row">
            <div [ngClass]="[
                'product-detail-images',
                'col-sm-4',
                'pl-0',
                'pr-5'
            ]">
                <mte-product-image
                    [src]="getMainImage()"
                    [hasMagnifier]="true">
                </mte-product-image>
            </div>
            <div [ngClass]="[
                'product-detail-info',
                'col-sm-8'
            ]">
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

                <product-detail-variable-attributes
                    *ngIf="hasVariations()"
                    [productDetail]="parentOrStandalone"
                    (displayedProductChange)="handleDisplayedProductChange($event)"
                    (selectedProductChange)="handleSelectedProductChange($event)">
                </product-detail-variable-attributes>

                <ng-container *ngIf="parentOrStandalone.isStandalone || isParentWithVariations()">
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
                </ng-container>

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
     * Represents the product currently being displayed.
     */
    public displayedProduct: Product
    public quantityToAdd = 1
    public addingToCart = false

    // Custom regions.

    public customRegions: CustomRegions

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
        // console.log(this)
    }

    // Lifecycle methods.

    public ngOnInit(): void {
        this.activatedRoute.params
            .pipe(
                switchMap((params: { slug: string }) => {
                    this.productService.getDetail(params.slug)
                    return this.productService.getDetails
                }),
                takeWhile(() => this.isAlive)
            )
            .subscribe((responseBody) => {
                this.parentOrStandalone = responseBody
                this.variations = this.parentOrStandalone.variations as Product[]
                this.populateDisplayedProduct()
                this.populateSelectedProduct()
            })

        this.organizationService.organizations.subscribe((organization) => {
            this.organization = organization
            this.customRegions = CustomRegionsHelper.getActiveCustomRegions(this.organization.storeUiContent.customRegions)
        })
    }

    public ngOnDestroy(): void { }

    // Init methods.

    private populateSelectedProduct(): void {
        if (!this.isParentWithVariations()) {
            this.selectedProduct = this.parentOrStandalone
        }
    }

    private populateDisplayedProduct(): void {

        // If it's variable, set the default variation as the selected product.

        if (this.isParentWithVariations()) {
            this.displayedProduct = this.variations.find((p) => p.isDefaultVariation)

            // If there's no default variation, just choose the first one.

            if (!this.displayedProduct) {
                this.displayedProduct = this.variations[0]
            }
        }
        else {
            this.displayedProduct = this.parentOrStandalone
        }

        this.uiService.setTitle(ProductHelper.getName(this.parentOrStandalone))
    }

    public getMainImage(): string {
        if (!!this.selectedProduct) {
            if (!!this.selectedProduct.featuredImages[0]) {
                return this.selectedProduct.featuredImages[0].medium
            } else {
                return this.selectedProduct.images[0].medium
            }
        } else {
            if (!!this.displayedProduct.featuredImages[0]) {
                return this.displayedProduct.featuredImages[0].medium
            } else {
                return this.displayedProduct.images[0].medium
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

    public hasVariations(): boolean {
        return this.variations != null && this.variations.length > 0
    }

    public isParentWithVariations(): boolean {
        return this.parentOrStandalone.isParent && this.hasVariations()
    }

    public addToCartShouldBeDisabled(): boolean {
        return !this.selectedProduct
            || !this.quantityToAdd
            || this.addingToCart
            || !CartHelper.getNumberAvailableToAdd(this.cartService.cart, this.selectedProduct)
    }

    // Interactions.

    public addToCart(): void {
        if (!this.selectedProduct) return
        this.addingToCart = true
        this.cartService.add(this.selectedProduct._id, this.quantityToAdd)
            .then(() => this.addingToCart = false)
    }

    // Event handlers.

    public handleSelectedProductChange(variation: Product): void {
        if (variation || variation === null) {
            this.selectedProduct = variation
        }
    }

    public handleDisplayedProductChange(variation: Product): void {
        this.displayedProduct = variation
    }
}
