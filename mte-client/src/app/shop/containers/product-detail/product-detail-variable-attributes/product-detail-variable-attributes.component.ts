import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core'
import { AbstractControl, FormControl, FormGroup } from '@angular/forms'
import { ProductHelper } from '@mte/common/helpers/product.helper'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { Attribute } from '@mte/common/models/api-interfaces/attribute'
import { AttributeValue } from '@mte/common/models/api-interfaces/attribute-value'
import { Product } from '@mte/common/models/api-interfaces/product'
import { SimpleAttributeValue } from '@mte/common/models/api-interfaces/simple-attribute-value'
import { VariableAttributeSelectOptionType } from '@mte/common/models/enums/variable-attribute-select-option-type'
import { VariableAttributeSelectType } from '@mte/common/models/enums/variable-attribute-select-type';
import { VariableAttributeSelect, VariableAttributeSelectOption, VariableAttributeSelectState } from '@mte/common/models/ui-models/variable-attribute-select'
import { isEqual, startCase, uniqBy, values } from 'lodash'
import { zip, Subscription } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'
import { OrganizationService } from '../../../../shared/services/organization.service'
import { ProductService } from '../../../services'

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
                            <option [ngValue]="null">
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
                (click)="reset()">
                Reset form
            </button>
        </div>
    `,
    styleUrls: [ './product-detail-variable-attributes.component.scss' ],
    encapsulation: ViewEncapsulation.None,
})
@Heartbeat()
export class ProductDetailVariableAttributesComponent extends HeartbeatComponent implements OnInit, OnDestroy {
    @Input() public productDetail: Product
    @Output() public selectedProductChange = new EventEmitter<Product>()
    @Output() public displayedProductChange = new EventEmitter<Product>()

    public variations: Product[] = []
    public matchingVariations: Product[] = []
    public variableAttributeSelects: VariableAttributeSelect<any, any>[] = []
    public selectedVariation: Product

    constructor(
        public productService: ProductService,
        public organizationService: OrganizationService,
    ) { super() }

    public ngOnInit(): void {
        this.variations = this.productDetail.variations as Product[]
        this.variableAttributeSelects = this.getVariableAttributeSelects()

        const selectedOptionsSources = this.variableAttributeSelects.map((select) => select.selectedOptionsSource)
        zip(...selectedOptionsSources)
            .subscribe((selectedOptions) => {
                this.matchingVariations = this.getMatchingVariations(selectedOptions)
                this.variableAttributeSelects.forEach((variableAttrSelect) => {
                    variableAttrSelect.setStateSilently({ matchingVariations: this.matchingVariations })
                })
                const unselectedAttributeSelects = this.variableAttributeSelects.filter((attrSelect) => attrSelect.state.selectedOption === null) || []

                // Set the 'all available' state when appropriate (making all options selectable
                // rather than disabling those that don't exist in the current list is matching variations).

                let makeAllOptionsAvailable = false
                if (!unselectedAttributeSelects.length) {
                    makeAllOptionsAvailable = true
                }
                this.variableAttributeSelects.forEach((variableAttrSelect) => {
                    variableAttrSelect.setStateSilently({ allOptionsAreAvailable: makeAllOptionsAvailable })
                })

                // If there's only 1 matching variation, select it!

                if (this.matchingVariations.length === 1) {
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

                else {
                    this.displayedProductChange.emit(this.matchingVariations[0])
                }
            })
    }

    public ngOnDestroy(): void { }

    public handleChange(variableAttributeSelect: VariableAttributeSelect<any, any>, option: any): void {

        // If a variation is selected, assume the user wants to select a different one now;
        // clear it and clear all selects.

        if (!!this.selectedVariation) {
            this.selectedVariation = null
            this.selectedProductChange.emit(null)
            this.variableAttributeSelects.forEach((attributeSelect) => {
                attributeSelect.select(null)
            })
        }

        // Make our selection and update all siblings.

        variableAttributeSelect.select(option)
        this.variableAttributeSelects.forEach((attributeSelect) => {
            attributeSelect.update()
        })
    }

    public getVariableAttributeSelects(): VariableAttributeSelect<any, any>[] {
        const variations = this.productDetail.variations as Product[]

        // Get the variable attributes for the product, trusting the attribute values
        // rather than the `variableAttributes` field. Loop through each variation to
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

        // For variable properties, we DO need to fall back on trusting the parent product.

        const variableProperties = this.productDetail.variableProperties

        // Loop through all the variable attributes and properties, and build a VariableAttributeSelect
        // for each one.

        const _combinedVariableAttributesAndProperties = this.organizationService.organization.storeUiSettings.combinedVariableAttributeSelects || []
        const combinedVariableAttributesAndProperties = values(_combinedVariableAttributesAndProperties)
            .map((doc) => {
                const keys = Object.keys(doc)
                return keys
                    .filter((key) => !isNaN(parseInt(key, 10)))
                    .map((key) => doc[key])
            })

        const selects = [
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

                return combinedVariableAttributesAndProperties.every((combination) => {
                    return combination.indexOf(keyOrSlug) === -1
                })
            })
            .map((variableAttributeOrProperty) => {
                const variableAttributeSelect = new VariableAttributeSelect()
                variableAttributeSelect.builder
                    .setProductDetail(this.productDetail)
                    .setAttributesOrProperties([{
                        type: typeof variableAttributeOrProperty === 'string'
                            ? VariableAttributeSelectType.Property
                            : VariableAttributeSelectType.Attribute,
                        attributeOrProperty: variableAttributeOrProperty,
                    }])
                return variableAttributeSelect
            })

        if (!!combinedVariableAttributesAndProperties.length) {
            combinedVariableAttributesAndProperties.forEach((combination) => {
                const variableAttributesOrProperties = combination.map((variableAttrSlugOrPropertyKey) => {
                    const variableAttribute = variableAttributes.find((attr) => attr.slug === variableAttrSlugOrPropertyKey)
                    let propertyKey: string
                    if (!variableAttribute) {
                        propertyKey = variableAttrSlugOrPropertyKey
                        return {
                            type: VariableAttributeSelectType.Property,
                            attributeOrProperty: propertyKey,
                        }
                    }
                    else {
                        return {
                            type: VariableAttributeSelectType.Attribute,
                            attributeOrProperty: variableAttribute,
                        }
                    }
                })

                const combinedVariableAttributeSelect = new VariableAttributeSelect()

                combinedVariableAttributeSelect.builder
                    .setProductDetail(this.productDetail)
                    .setAttributesOrProperties(variableAttributesOrProperties)

                selects.push(combinedVariableAttributeSelect)
            })
        }

        return selects
            .sort((a, b) => {
                const orderArr = this.organizationService.organization.storeUiSettings.orderOfVariableAttributeSelects
                if (orderArr.indexOf(b.attribute.slug) === -1) return -1
                else if (orderArr.indexOf(a.attribute.slug) === -1) return 1
                return orderArr.indexOf(a.attribute.slug) - orderArr.indexOf(b.attribute.slug)
            })
    }

    public getMatchingVariations(selectedOptions: VariableAttributeSelectOption<AttributeValue>[]): Product[] {
        return this.variations.filter((variation) => {
            return selectedOptions
                .filter((x) => x != null)
                .reduce((matchingVariations, selectedOption) => {
                    return uniqBy([ ...matchingVariations, ...selectedOption.matchingVariations ], '_id')
                }, [] as Product[])
                // .filter((option) => option !== null)
                // .every((option) => {
                //     switch (option.type) {
                //         case VariableAttributeSelectOptionType.PropertyValue:
                //             return isEqual(option.data, variation[option.key])
                //         case VariableAttributeSelectOptionType.SimpleAttributeValue:
                //             return !!variation.simpleAttributeValues
                //                 .find((simpleAttrValue) => isEqual(option.data as SimpleAttributeValue, simpleAttrValue))
                //         case VariableAttributeSelectOptionType.AttributeValue:
                //             return !!variation.attributeValues
                //                 .find((attrValue: AttributeValue) => {
                //                     return option.data._id === attrValue._id
                //                 })
                //     }
                // })
        })
    }

    public reset(): void {
        this.variableAttributeSelects.forEach((variableAttrSelect) => {
            variableAttrSelect.select(null)
        })
    }
}
