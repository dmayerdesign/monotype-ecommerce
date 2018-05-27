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
import { VariableAttributeSelect, VariableAttributeSelectOption, VariableAttributeSelectState } from '@mte/common/models/ui-models/variable-attribute-select'
import { isEqual, startCase } from 'lodash'
import { zip, Subscription } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'
import { ProductService } from '../../../services'

@Component({
    selector: 'product-detail-variable-attributes',
    template: `
        <div id="variable-attributes"
             class="variable-attributes">

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
        public productService: ProductService
    ) { super() }

    public ngOnInit(): void {
        this.variations = this.productDetail.variations as Product[]
        this.variableAttributeSelects = this.getVariableAttributeSelects()

        const selectedOptionsSources = this.variableAttributeSelects.map((select) => select.selectedOptionsSource)
        zip(...selectedOptionsSources)
            .subscribe((selectedOptions) => {
                this.matchingVariations = this.getMatchingVariations(selectedOptions)
                this.displayedProductChange.emit(this.matchingVariations[0])
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

        return [ ...variableAttributes, ...variableProperties ]
            .map((variableAttributeOrProperty) => {
                const variableAttributeSelect = new VariableAttributeSelect()
                variableAttributeSelect.builder
                    .setProductDetail(this.productDetail)
                    .setAttributeOrProperty(variableAttributeOrProperty)
                return variableAttributeSelect
            })
    }

    public getMatchingVariations(selectedOptions: VariableAttributeSelectOption<AttributeValue>[]): Product[] {
        return this.variations.filter((variation) => {
            return selectedOptions
                .filter((option) => option !== null)
                .every((option) => {
                    switch (option.type) {
                        case VariableAttributeSelectOptionType.PropertyValue:
                            return isEqual(option.data, variation[option.key])
                        case VariableAttributeSelectOptionType.SimpleAttributeValue:
                            return !!variation.simpleAttributeValues
                                .find((simpleAttrValue) => isEqual(option.data as SimpleAttributeValue, simpleAttrValue))
                        case VariableAttributeSelectOptionType.AttributeValue:
                            return !!variation.attributeValues
                                .find((attrValue: AttributeValue) => {
                                    return option.data._id === attrValue._id
                                })
                    }
                })
        })
    }

    private mapSelectStatesToSelectedOptions(states: VariableAttributeSelectState[]): VariableAttributeSelectOption<AttributeValue>[] {
        return states
            .map((state) => state.selectedOption)
            .filter((option) => option !== null)
    }
}
