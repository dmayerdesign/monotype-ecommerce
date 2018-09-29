import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { CustomRegions } from '@mte/common/api/interfaces/custom-regions'
import { Organization } from '@mte/common/api/interfaces/organization'
import { Product } from '@mte/common/api/interfaces/product'
import { CartHelper } from '@mte/common/helpers/cart.helper'
import { CustomRegionsHelper } from '@mte/common/helpers/custom-regions.helper'
import { ProductHelper } from '@mte/common/helpers/product.helper'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { switchMap, takeWhile } from 'rxjs/operators'
import { CartService } from '../../../shared/services/cart.service'
import { OrganizationService } from '../../../shared/services/organization.service'
import { UiService } from '../../../shared/services/ui.service'
import { ProductService } from '../../services/product.service'
import { ProductDetailVariableAttributesComponent } from './product-detail-variable-attributes/product-detail-variable-attributes.component'

@Component({
    selector: 'mte-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        ProductService,
    ],
})
@Heartbeat()
export class ProductDetailComponent extends HeartbeatComponent implements OnInit, OnDestroy {

    // Child components.

    @ViewChild(ProductDetailVariableAttributesComponent)
    public variableAttributesComponent: ProductDetailVariableAttributesComponent

    // State.

    public organization: Organization
    /** Represents the product that is displayed when the view is loaded. */
    public parentOrStandalone: Product
    /** Represents any variations associated with the product, if the product is a Parent. */
    public variations: Product[]
    /** Represents the product that will be added to the cart. */
    public selectedProduct: Product
    /** Represents the product currently being displayed. */
    public displayedProduct: Product
    public quantityToAdd = 1
    public addingToCart = false
    public showAddToCartSuccess = false

    // Custom regions.

    public customRegions: CustomRegions

    // Helpers.

    public customRegionsHelper = CustomRegionsHelper
    public productHelper = ProductHelper

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _cartService: CartService,
        private _productService: ProductService,
        private _organizationService: OrganizationService,
        private _uiService: UiService,
    ) {
        super()
    }

    // Lifecycle methods.

    public ngOnInit(): void {
        this._activatedRoute.params
            .pipe(
                switchMap((params: { slug: string }) => {
                    this._productService.getDetail(params.slug)
                    return this._productService.getDetails
                }),
                takeWhile(() => this.isAlive)
            )
            .subscribe((responseBody) => {
                this.parentOrStandalone = responseBody
                this.variations = this.parentOrStandalone.variations as Product[]
                this.populateDisplayedProduct()
                this.populateSelectedProduct()
            })

        this._organizationService.organizations.subscribe((organization) => {
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

        this._uiService.setTitle(ProductHelper.getName(this.parentOrStandalone))
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
            || !CartHelper.getNumberAvailableToAdd(this._cartService.cart, this.selectedProduct)
    }

    // Interactions.

    public async addToCart(): Promise<void> {
        if (!this.selectedProduct) return
        this.addingToCart = true
        await this._cartService.add(this.selectedProduct._id, this.quantityToAdd)
        this.addingToCart = false
        this.showAddToCartSuccess = true
        this.variableAttributesComponent.reset()
        setTimeout(() => this.showAddToCartSuccess = false, 10000)
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
