import { Component, EventEmitter, Input, Output } from '@angular/core'
import { AbstractControl, FormControl, FormGroup } from '@angular/forms'
import { ProductHelper } from '@mte/common/helpers/product.helper'
import { Attribute } from '@mte/common/models/api-interfaces/attribute'
import { AttributeValue } from '@mte/common/models/api-interfaces/attribute-value'
import { Product } from '@mte/common/models/api-interfaces/product'
import { SimpleAttributeValue } from '@mte/common/models/api-interfaces/simple-attribute-value'
import { VariableAttributesAndOptions } from '@mte/common/models/interfaces/common/variable-attributes-and-options'
import { Subscription } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'
import { ProductService } from '../../../services'

@Component({
    selector: 'product-detail-variable-attributes',
    template: `
        <div class="variable-attributes">
            <form *ngIf="variableAttributesFormDidInit"
                [formGroup]="variableAttributesForm">
                <div *ngFor="let variableAttrAndOptions of variableAttributesAndOptions">
                    <mte-form-field [options]="{
                            label: getVariableAttributeLabel(variableAttrAndOptions),
                            labelClass: 'variable-attributes--name'
                        }">
                        <select #input
                            [formControlName]="variableAttrAndOptions.attribute.slug">
                            <option [ngValue]="null">
                                Select {{ variableAttrAndOptions.attribute.singularName || variableAttrAndOptions.attribute.slug }}
                            </option>
                            <option *ngFor="let attributeValue of variableAttrAndOptions.attributeValues"
                                [ngValue]="attributeValue"
                                [disabled]="attributeValueIsUnavailable(attributeValue)">
                                {{ attributeValue?.name || attributeValue?.slug }}
                                <ng-container *ngIf="attributeValueIsUnavailable(attributeValue) && !!selectedVariableAttributeValue()">
                                    not available in {{ selectedVariableAttributeValue()?.slug }}
                                </ng-container>
                            </option>
                        </select>
                    </mte-form-field>
                </div>
            </form>
        </div>
    `
})
export class ProductDetailVariableAttributesComponent {
    @Input() public productDetail: Product
    @Output() public selectedProductChange = new EventEmitter<Product>()
    @Output() public displayedProductChange = new EventEmitter<Product>()

    public possibleVariations: Product[] = []
    public variableAttributesAndOptions: VariableAttributesAndOptions = []
    public variableAttributesForm: FormGroup
    public variableAttributesFormValue: any = {}
    public variableAttributesFormDidInit = false
    public variableAttributesFormIsBeingChangedProgrammatically = false
    public variableAttributesFormIsFilled = false
    public variableAttributesFormValueChangesDisposable: Subscription

    constructor(
        public productService: ProductService
    ) { }

    public selectedVariableAttributeValue(): AttributeValue {
        if (!!this.variableAttributesForm) {

            // Get any one control with a truthy value from the form.

            const attributeFormControl: AbstractControl = [ ...Object.keys(this.variableAttributesForm.controls).map((key) => this.variableAttributesForm.get(key)).filter((x) => !!x.value) ][0]
            if (attributeFormControl) {
                return attributeFormControl.value as AttributeValue
            }
        }
        return null
    }

    public attributeValueIsUnavailable(attributeValue: AttributeValue): boolean {

        // This shouldn't apply if a product has been chosen.

        if (this.variableAttributesFormIsFilled && this.possibleVariations.length === 1) {
            return false
        }

        // And it shouldn't apply to the currently-selected variable attribute select.

        if (this.selectedVariableAttributeValue()) {
            const selectedAttribute = this.selectedVariableAttributeValue().attribute as Attribute
            if (selectedAttribute._id === (attributeValue.attribute as Attribute)._id) {
                return false
            }
        }

        // The attribute value is unavailable if none of the possible variations contains it.

        if (!this.possibleVariations.length) return false
        return this.possibleVariations.every((variation) => {
            return !variation.attributeValues.find((attrValue) => {
                const attrValueId = (typeof attrValue === 'string') ? attrValue : attrValue._id
                return attrValueId === attributeValue._id
            })
        })
    }

    private subscribeToVariableAttributesFormChanges(): void {
        // if (this.variableAttributesFormValueChangesDisposable) {
        //     this.variableAttributesFormValueChangesDisposable.unsubscribe()
        // }
        // this.variableAttributesFormValueChangesDisposable = this.variableAttributesForm.valueChanges
            // .pipe(
            //     tap((value) => {
            //         const values = Object.keys(value)
            //             .filter((key) => !!value[key])
            //             .map((key) => value[key]) as (AttributeValue | SimpleAttributeValue)[]

            //         if (this.variableAttributesFormIsFilled && !this.variableAttributesFormIsBeingChangedProgrammatically) {
            //             const keyOfControlChanged = Object.keys(this.variableAttributesFormValue)
            //                 .find((key) => this.variableAttributesFormValue[key] !== value[key])

            //             if (!!keyOfControlChanged && this.possibleVariations.length === 1) {
            //                 this.variableAttributesFormIsBeingChangedProgrammatically = true
            //                 let valuePatch = {}
            //                 Object.keys(value).filter((key) => key !== keyOfControlChanged).forEach((key) => {
            //                     valuePatch[key] = null
            //                 })
            //                 console.log(valuePatch)
            //                 this.variableAttributesForm.patchValue(valuePatch)
            //                 this.variableAttributesFormIsBeingChangedProgrammatically = false
            //             }
            //         }

            //         this.variableAttributesFormIsFilled = values.length === Object.keys(this.variableAttributesForm.controls).length
            //         this.variableAttributesFormValue = { ...value }
            //     }),

            //     // Don't run the subscription at certain times.

            //     filter((value) => {
            //         return !this.variableAttributesFormIsBeingChangedProgrammatically &&
            //             this.hasVariations() &&
            //             !!Object.keys(value).length
            //     }),

            //     // Map the form value to an array of AttributeValues.

            //     map((value) => Object.keys(value)
            //         .filter((key) => !!value[key])
            //         .map((key) => value[key]) as (AttributeValue | SimpleAttributeValue)[]
            //     )
            // )
            // .subscribe((values) => {

            //     // Get the list of possible variations,

            //     this.possibleVariations = this.productService.getVariationsFromAttributeValues(this.productDetail, values)

            //     console.log(this.possibleVariations.map(x => x.slug))
            //     console.log(this.variableAttributesFormIsFilled)

            //     if (!!this.possibleVariations.length) {

            //         // select a new default product from the list of possible variations,

            //         this.displayedProductChange.emit(this.possibleVariations[0])

            //         // and, if there's only one, auto-select its other attribute values in the form.

            //         if (this.possibleVariations.length === 1) {
            //             this.selectedProductChange.emit(this.possibleVariations[0])

            //             this.variableAttributesAndOptions.forEach((attrAndOptions) => {
            //                 const availableAttrValues = attrAndOptions.attributeValues.filter((attrValue) => {
            //                     return !this.attributeValueIsUnavailable(attrValue)
            //                 })
            //                 if (availableAttrValues.length === 1) {
            //                     this.variableAttributesFormIsBeingChangedProgrammatically = true
            //                     this.variableAttributesForm.get(attrAndOptions.attribute.slug)
            //                         .setValue(availableAttrValues[0])
            //                     this.variableAttributesFormIsBeingChangedProgrammatically = false
            //                 }
            //             })
            //         }
            //     }
            //     else {
            //         // this.populateSelectedProduct()
            //     }
            // })
    }

    private populateVariableAttributesAndOptions(): void {
        this.variableAttributesFormIsBeingChangedProgrammatically = true

        const newVariableAttributesAndOptions = ProductHelper.getVariableAttributesAndOptions(this.productDetail)

        this.variableAttributesAndOptions = newVariableAttributesAndOptions.map(({ attribute, attributeValues }) => {
            return {
                attribute,
                attributeValues: attributeValues.filter((attributeValue) => {
                    return this.productDetail.variations.some((variation: Product) => {
                        return !!variation.attributeValues.find((attrValue) => {
                            const attrValueId = (typeof attrValue === 'string') ? attrValue : attrValue._id
                            return attrValueId === attributeValue._id
                        })
                    })
                })
            }
        })

        // Build the form.

        this.variableAttributesForm = new FormGroup({})
        this.variableAttributesAndOptions
            .forEach(({ attribute, attributeValues }) => {
                this.variableAttributesForm.addControl(
                    attribute.slug,
                    new FormControl(null)
                )
            })

        this.variableAttributesFormDidInit = true
        this.variableAttributesFormIsBeingChangedProgrammatically = false
    }
}
