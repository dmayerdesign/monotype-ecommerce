import { isEqual, kebabCase, startCase } from 'lodash'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { ProductHelper } from '../../helpers/product.helper'
import { Attribute } from '../api-interfaces/attribute'
import { AttributeValue } from '../api-interfaces/attribute-value'
import { Product } from '../api-interfaces/product'
import { SimpleAttributeValue } from '../api-interfaces/simple-attribute-value'
import { Stateful } from '../common/stateful'
import { VariableAttributeSelectOptionType } from '../enums/variable-attribute-select-option-type'
import { VariableAttributeSelectType } from '../enums/variable-attribute-select-type'

export class VariableAttributeSelectState<TO extends AttributeValue = any> {
    public selectedOption?: VariableAttributeSelectOption<TO> = null
    public matchingVariations?: Product[] = []
    public availableOptions?: TO[]
    public wasFirstSelected? = false
    public allOptionsAreAvailable? = false
}

export interface VariableAttributeSelectAttribute<TA> {
    slug: string
    displayName: string
    data: TA | TA[]
}

export interface VariableAttributeSelectOption<TO extends AttributeValue> {
    type: VariableAttributeSelectOptionType
    label: string
    data: TO
    key?: string
    matchingVariations?: Product[]
}

export class VariableAttributeSelect<TA extends string | Attribute, TO extends AttributeValue> extends Stateful<VariableAttributeSelectState> {
    protected _state = new VariableAttributeSelectState()
    private _productDetail: Product
    private _variations: Product[]
    public type: VariableAttributeSelectType
    public attribute: VariableAttributeSelectAttribute<TA>
    public options: VariableAttributeSelectOption<TO>[]

    // Builder.
    public builder = {
        setProductDetail: (productDetail: Product) => {
            this._productDetail = productDetail
            this._variations = this._productDetail.variations as Product[]
            this.setState({ matchingVariations: [ ...this._variations ] })
            return this.builder
        },
        setAttributesOrProperties: (attributesOrProperties: (Attribute | string)[]) => {
            const attributesAndOptions: { attribute: VariableAttributeSelectAttribute<TA>, options: VariableAttributeSelectOption<TO>[] }[] = []

            attributesOrProperties.forEach((attributeOrProperty) => {
                let attribute: {
                    slug: string
                    displayName: string
                    data: TA // e.g. Attribute
                }
                let options: VariableAttributeSelectOption<TO>[]

                this.type = typeof attributeOrProperty === 'string' ? VariableAttributeSelectType.Property : VariableAttributeSelectType.Attribute

                // If it's a variable property:

                if (this.type === VariableAttributeSelectType.Property) {
                    attribute = {
                        slug: kebabCase(attributeOrProperty as string),
                        displayName: startCase(attributeOrProperty as string),
                        data: attributeOrProperty as TA,
                    }

                    options = this._variations.reduce(
                        (_options, variation) => {
                            const data = variation[attribute.data as string]
                            const existingOption = _options.find((option) => isEqual(option, data))
                            if (!existingOption) {
                                _options.push({
                                    type: VariableAttributeSelectOptionType.PropertyValue,
                                    label: data,
                                    key: attribute.data as string,
                                    data,
                                    matchingVariations: [ variation ],
                                })
                            }
                            else {
                                existingOption.matchingVariations.push(variation)
                            }
                            return _options
                        },
                        [] as VariableAttributeSelectOption<TO>[]
                    )
                }

                // If it's an Attribute:

                else if (this.type === VariableAttributeSelectType.Attribute) {
                    attribute = {
                        slug: (attributeOrProperty as Attribute).slug,
                        displayName: (attributeOrProperty as Attribute).singularName || (attributeOrProperty as Attribute).slug,
                        data: attributeOrProperty as TA
                    }

                    options = this._variations.reduce(
                        (_options, variation) => {
                            const allVariationAttributeValues: TO[] = [
                                ...variation.simpleAttributeValues as TO[],
                                ...variation.attributeValues as TO[],
                            ]

                            _options = _options.concat(
                                allVariationAttributeValues
                                    .map((attrValue) => {
                                        if ((attrValue.attribute as Attribute)._id === (attribute.data as Attribute)._id) {
                                            const existingOption = _options
                                                .find((option) => attrValue.value === option.data.value)
                                            if (!existingOption) {
                                                const label = (attrValue as AttributeValue).name || attrValue.value
                                                return {
                                                    type: ProductHelper.isAttributeValue(attrValue) ? VariableAttributeSelectOptionType.AttributeValue : VariableAttributeSelectOptionType.SimpleAttributeValue,
                                                    label,
                                                    data: attrValue,
                                                    matchingVariations: [ variation ],
                                                } as VariableAttributeSelectOption<TO>
                                            }
                                            else {
                                                existingOption.matchingVariations.push(variation)
                                            }
                                        }
                                    })
                            )
                            return _options.filter((x) => x != null)
                        },
                        [] as VariableAttributeSelectOption<TO>[]
                    )
                }

                attributesAndOptions.push({
                    attribute,
                    options,
                })
            })

            if (attributesOrProperties.length === 1) {
                this.attribute = attributesAndOptions[0].attribute
                this.options = attributesAndOptions[0].options
            }
            else if (attributesOrProperties.length === 2) {
                this.attribute = {
                    slug: `${attributesAndOptions[0].attribute.slug}-and-${attributesAndOptions[1].attribute.slug}`,
                    displayName: `${attributesAndOptions[0].attribute.displayName} / ${attributesAndOptions[1].attribute.displayName}`,
                    data: attributesAndOptions.reduce((acc, current) => [ ...acc, current.attribute.data ], []) as TA[]
                }
                this.options = attributesAndOptions.reduce((acc, current) => [ ...acc, current.options ], []) as VariableAttributeSelectOption<TO>[]
            }
            else {
                throw new Error('Combining more than 2 attributes in a select is not supported.')
            }

            return this.builder
        }

    }

    // State selection and mutation.
    public set selectedOptionModel(selectedOption: VariableAttributeSelectOption<TO>) {
        this.select(selectedOption)
    }

    public get selectedOptionModel(): VariableAttributeSelectOption<TO> {
        return this.state.selectedOption
    }

    public select(selectedOption: VariableAttributeSelectOption<TO>): void {
        this.setState({ selectedOption })
    }

    public selectSilently(selectedOption: VariableAttributeSelectOption<TO>): void {
        this.setStateSilently({ selectedOption })
    }

    public get selectedOptionChanges(): Observable<VariableAttributeSelectOption<TO>> {
        return this.selectedOptionsSource.pipe(distinctUntilChanged())
    }

    public get selectedOptionsSource(): Observable<VariableAttributeSelectOption<TO>> {
        return this.states.pipe(
            map((state) => state.selectedOption),
        )
    }

    public optionIsAvailable(option: TO): boolean {
        return this.state.allOptionsAreAvailable || !!this.getAvailableOptions()
            .find((availableOption) => isEqual(option, availableOption))
    }

    public getAvailableOptions(): VariableAttributeSelectOption<TO>[] {
        // TODO: Handle 2-dimensional options.

        return this.options.filter((option) => {

            // For each option, test whether any of the currently-matching variations has it.

            return this.state.matchingVariations.some((variation) => {

                // If we're looking for an attribute value, test to see if any of the variation's
                // `attributeValues` or `simpleAttributeValues` has a `value` equal to `option.data.value`.

                if (this.type === VariableAttributeSelectType.Attribute) {
                    const allAttributeValues = [
                        ...variation.attributeValues as AttributeValue[],
                        ...variation.simpleAttributeValues as SimpleAttributeValue[],
                    ]
                    return allAttributeValues
                        .some(({ value }) => option.data.value === value)
                }

                // If we're looking for a property value, loop through the parent product's
                // `variableProperties` to get the variation's values for those property keys,
                // and try to find one of those values that's equal to `option`.

                if (this.type === VariableAttributeSelectType.Property) {
                    return this._productDetail.variableProperties
                        .map((key) => variation[key])
                        .some((value) => value === option.data)
                }
            })
        })
    }

    // Update.
    public update(): void {
        const stateUpdate: VariableAttributeSelectState = {
            availableOptions: this.getAvailableOptions(),
        }
        if (stateUpdate.availableOptions.length === 1) {
            stateUpdate.selectedOption = stateUpdate.availableOptions[0]
        }
        this.setState(stateUpdate)
    }
}
