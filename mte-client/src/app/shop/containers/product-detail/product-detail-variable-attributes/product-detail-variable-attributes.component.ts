import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core'
import { MongooseHelper as mh } from '@mte/common/helpers/mongoose.helper'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { Attribute } from '@mte/common/models/api-interfaces/attribute'
import { AttributeValue } from '@mte/common/models/api-interfaces/attribute-value'
import { Product } from '@mte/common/models/api-interfaces/product'
import { SimpleAttributeValue } from '@mte/common/models/api-interfaces/simple-attribute-value'
import { VariableAttributeSelectOptionType } from '@mte/common/models/enums/variable-attribute-select-option-type'
import { VariableAttributeSelect, VariableAttributeSelectOption } from '@mte/common/models/ui-models/variable-attribute-select'
import { isEqual } from 'lodash'
import { zip } from 'rxjs'
import { map, takeWhile } from 'rxjs/operators'
import { CartService } from '../../../../shared/services/cart/cart.service'
import { OrganizationService } from '../../../../shared/services/organization.service'
import { ProductService } from '../../../services/product.service'

@Component({
    selector: 'product-detail-variable-attributes',
    template: `
        <div id="variable-attributes-form">
            <div class="variable-attributes">
                <div *ngFor="let variableAttrSelect of variableAttributeSelects">
                    <mte-form-field
                        [options]="{
                            label: variableAttrSelect.attribute.displayName,
                            labelClass: 'variable-attributes--name'
                        }">
                        <select #input
                            [ngModel]="variableAttrSelect.selectedOptionModel"
                            (ngModelChange)="handleChange(variableAttrSelect, $event)">
                            <option [ngValue]="null"
                                [disabled]="variableAttrSelect.selectedOptionModel !== null">
                                Select {{ variableAttrSelect.attribute.displayName || variableAttrSelect.attribute.slug }}
                            </option>
                            <option *ngFor="let option of variableAttrSelect.options"
                                [ngValue]="option"
                                [disabled]="!variableAttrSelect.optionIsAvailable(option)">
                                {{ option.label }}
                            </option>
                        </select>
                    </mte-form-field>
                </div>
            </div>
            <button class="variable-attributes-reset-btn"
                [disabled]="variableAttributeSelectsAreAllNull()"
                (click)="reset()">
                Reset form
            </button>
        </div>
    `,
    styleUrls: [ './product-detail-variable-attributes.component.scss' ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        ProductService,
    ],
})
@Heartbeat()
export class ProductDetailVariableAttributesComponent extends HeartbeatComponent implements OnInit, OnDestroy {
    @Input() public productDetail: Product
    @Output() public selectedProductChange = new EventEmitter<Product>()
    @Output() public displayedProductChange = new EventEmitter<Product>()

    public variations: Product[] = []
    public matchingVariations: Product[] = []
    public variableAttributeSelects: VariableAttributeSelect[] = []
    public selectedVariation: Product

    constructor(
        public productService: ProductService,
        public organizationService: OrganizationService,
        public cartService: CartService,
        public ngZone: NgZone,
    ) {
        super()
    }

    public ngOnInit(): void {
        // We can trust this to always fire at least once, since it's attached to a BehaviorSubject.
        this.cartService.store.states.subscribe(() => this.initForm())
    }

    public ngOnDestroy(): void { }

    public initForm(): void {

        // First, create a list of variations that haven't yet been added to cart.

        this.variations = (this.productDetail.variations as Product[]).filter((variation) => {
            return !this.cartService.cart.items.find((item: Product) => item._id === variation._id)
        })

        // Create an observable that maps each `select` to an array of all selected options whenever
        // one changes.

        const variableAttributeSelects = this.variableAttributeSelects = this.getVariableAttributeSelects()
        const selectedOptionsSources = this.variableAttributeSelects.map((select) => select.selectedOptionSource)
        zip(...selectedOptionsSources)
            .pipe(
                takeWhile(() => this.variableAttributeSelects === variableAttributeSelects),
                map((selectedOptions) => selectedOptions.filter((selectedOption) => selectedOption !== null)),
            )
            .subscribe((selectedOptions) => {

                // Update the list of matching variations and let each VariableAttributeSelect know.

                this.matchingVariations = this.getMatchingVariations(selectedOptions)
                this.variableAttributeSelects.forEach((variableAttrSelect) => {
                    variableAttrSelect.setStateSilently({ matchingVariations: this.matchingVariations })
                    setTimeout(() => variableAttrSelect.update(true))
                })

                // If there's only 1 matching variation, select it!

                if (this.matchingVariations.length === 1) {
                    const unselectedAttributeSelects = this.variableAttributeSelects.filter((attrSelect) => attrSelect.state.selectedOption === null) || []
                    const matchedVariation = this.matchingVariations[0]
                    this.selectedVariation = matchedVariation
                    this.displayedProductChange.emit(matchedVariation)
                    this.selectedProductChange.emit(matchedVariation)

                    // If there's a newly selected variation but some selects don't have a selection,
                    // give them one (each should only have 1 available option in this situation).

                    if (!!unselectedAttributeSelects.length) {
                        unselectedAttributeSelects.forEach((unselectedAttrSelect) => {
                            const newSelectedOption = unselectedAttrSelect.options.find((option) => {
                                return unselectedAttrSelect.optionIsAvailable(option)
                            })
                            unselectedAttrSelect.select(newSelectedOption)
                        })
                    }
                }

                // If there's more than one, display the first one.

                else if (this.matchingVariations.length > 1) {
                    this.displayedProductChange.emit(this.matchingVariations[0])
                }
            })
    }

    public handleChange(variableAttributeSelect: VariableAttributeSelect, option: any): void {

        // Make our selection and update all siblings.

        variableAttributeSelect.select(option)
        this.variableAttributeSelects.forEach((variableAttrSelect) => variableAttrSelect.update())
    }

    public getVariableAttributeSelects(): VariableAttributeSelect[] {
        const variations = this.variations

        // Get the variable attributes for the product, trusting the attribute values on each variation
        // rather than the `variableAttributes` field on the parent. Loop through each variation to
        // get a de-duped array of variable attributes.

        const variableAttributes = variations.reduce(
            (commonVariableAttributes: Attribute[], currentVariation: Product) => {
                const allAttributeValues = [
                    ...currentVariation.attributeValues,
                    ...currentVariation.simpleAttributeValues,
                ]
                allAttributeValues.forEach(({ attribute }: AttributeValue) => {
                    // Check for uniqueness.
                    if (!commonVariableAttributes.find((commonVariableAttribute) =>
                        commonVariableAttribute._id === (attribute as Attribute)._id)) {
                        // If it's unique, add it to the array.
                        commonVariableAttributes.push(attribute as Attribute)
                    }
                })
                return commonVariableAttributes
            },
            [] as Attribute[]
        )

        // Naturally, for variable _properties_, we DO need to fall back on trusting the parent product.

        const variableProperties = this.productDetail.variableProperties

        // Loop through all the variable attributes and properties, and build a VariableAttributeSelect
        // for each one.

        // First, determine which attributes/properties are supposed to be combined together.

        const combinedVariableAttributesAndProperties = this.organizationService.organization
            .storeUiSettings
            .combinedVariableAttributeSelects
            || []

        // Create an array of selects representing all UN-combined properties/attributes.

        const attributesAndProperties = [
                ...variableAttributes,
                ...variableProperties,
            ]
            .filter((variableAttributeOrProperty) => {
                let keyOrSlug: string
                if (typeof variableAttributeOrProperty === 'string') {
                    keyOrSlug = variableAttributeOrProperty
                }
                else {
                    keyOrSlug = variableAttributeOrProperty.slug
                }
                // Note: using `values` because mongo will return back arrays as objects
                // sometimes, depending on how they were created.
                return mh.toArray(combinedVariableAttributesAndProperties).every((combination) =>
                    mh.toArray(combination).indexOf(keyOrSlug) === -1)
            })

        // For each one, create a `VariableAttributeSelect` and build it.

        const selects = attributesAndProperties
            .map((variableAttributeOrProperty) => {
                const variableAttributeSelect = new VariableAttributeSelect()
                variableAttributeSelect.builder
                    .setProductDetail(this.productDetail)
                    .setAttributesOrProperties([variableAttributeOrProperty])
                return variableAttributeSelect
            })

        // Then, add any property/attribute combinations to the array of selects.

        if (!!combinedVariableAttributesAndProperties.length) {
            combinedVariableAttributesAndProperties.forEach((combination) => {
                const variableAttributesOrProperties = mh.toArray(combination)
                    // Note: sometimes includes `id` or other crap, so filter that out.
                    // We just want our 0, 1, etc.
                    .filter((x) => x != null)
                    .map((variableAttrSlugOrPropertyKey) => {
                        const variableAttribute = variableAttributes.find((attr) => attr.slug === variableAttrSlugOrPropertyKey)
                        if (!variableAttribute) {
                            return variableAttrSlugOrPropertyKey
                        }
                        else {
                            return variableAttribute
                        }
                    })

                // Build the combined select.

                const combinedVariableAttributeSelect = new VariableAttributeSelect()
                combinedVariableAttributeSelect.builder
                    .setProductDetail(this.productDetail)
                    .setAttributesOrProperties(variableAttributesOrProperties)

                // Add it to the array.

                selects.push(combinedVariableAttributeSelect)
            })
        }

        // Finally, sort them in the order specified in `organization.storeUiSettings`.

        return selects
            .sort((a, b) => {
                const orderArr = this.organizationService.organization
                    .storeUiSettings
                    .orderOfVariableAttributeSelects
                if (orderArr.indexOf(b.attribute.slug) === -1) return -1
                else if (orderArr.indexOf(a.attribute.slug) === -1) return 1
                return orderArr.indexOf(a.attribute.slug) - orderArr.indexOf(b.attribute.slug)
            })
    }

    public getMatchingVariations(selectedOptions: VariableAttributeSelectOption[]): Product[] {
        return this.variations.filter((variation) => {
            const variationContainsOptionValue = (option: VariableAttributeSelectOption) => {
                switch (option.type) {
                    case VariableAttributeSelectOptionType.PropertyValue:
                        return isEqual(option.data, variation[option.key])
                    case VariableAttributeSelectOptionType.SimpleAttributeValue:
                        return !!variation.simpleAttributeValues
                            .find((simpleAttrValue) => isEqual(option.data as SimpleAttributeValue, simpleAttrValue))
                    case VariableAttributeSelectOptionType.AttributeValue:
                        return !!variation.attributeValues
                            .find((attrValue: AttributeValue) => {
                                return (option.data as AttributeValue)._id === attrValue._id
                            })
                    case VariableAttributeSelectOptionType.Combination:
                        return option.sourceOptions.every((sourceOption) => {
                            return variationContainsOptionValue(sourceOption)
                        })
                }
            }

            return selectedOptions
                .every(variationContainsOptionValue)
        })
    }

    public reset(): void {
        this.matchingVariations = [ ...this.variations ]
        this.selectedVariation = null
        this.selectedProductChange.emit(null)
        this.initForm()
    }

    public variableAttributeSelectsAreAllNull(): boolean {
        return this.variableAttributeSelects.every((select) => select.state.selectedOption == null)
    }
}
