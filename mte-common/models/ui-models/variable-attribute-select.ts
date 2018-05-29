import { isEqual, kebabCase, startCase, uniqBy } from 'lodash'
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
    type?: VariableAttributeSelectOptionType
    label?: string
    data?: TO
    key?: string
    matchingVariations?: Product[]
    sourceOptions?: VariableAttributeSelectOption<TO>[]
}

export class VariableAttributeSelect<TA extends string | Attribute, TO extends AttributeValue> extends Stateful<VariableAttributeSelectState> {
    protected _state = new VariableAttributeSelectState()
    private _productDetail: Product
    private _variations: Product[]
    public type: VariableAttributeSelectType
    private _attribute: VariableAttributeSelectAttribute<TA>
    private _options: VariableAttributeSelectOption<TO>[]
    public combination: VariableAttributeSelect<TA, TO>[]

    // Builder.

    public builder = {
        setProductDetail: (productDetail: Product) => {
            this._productDetail = productDetail
            this._variations = this._productDetail.variations as Product[]
            this.setState({ matchingVariations: [ ...this._variations ] })
            return this.builder
        },
        setAttributesOrProperties: (configs: {
            type: VariableAttributeSelectType,
            attributeOrProperty: Attribute | string
        }[]) => {
            const attributesAndOptions: { attribute: VariableAttributeSelectAttribute<TA>, options: VariableAttributeSelectOption<TO>[] }[] = []

            configs.forEach(({ type, attributeOrProperty }) => {
                let attribute: VariableAttributeSelectAttribute<TA>
                let options: VariableAttributeSelectOption<TO>[]

                // If it's a variable property:

                if (type === VariableAttributeSelectType.Property) {
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

                else if (type === VariableAttributeSelectType.Attribute) {
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

            if (configs.length === 1) {
                if (attributesAndOptions[0].options[0].type === VariableAttributeSelectOptionType.PropertyValue) {
                    this.type = VariableAttributeSelectType.Property
                }
                else {
                    this.type = VariableAttributeSelectType.Attribute
                }
                this._attribute = attributesAndOptions[0].attribute
                this._options = attributesAndOptions[0].options
            }
            else if (configs.length === 2) {
                this.type = VariableAttributeSelectType.Combination

                this._attribute = {
                    slug: `${attributesAndOptions[0].attribute.slug}-and-${attributesAndOptions[1].attribute.slug}`,
                    displayName: `${attributesAndOptions[0].attribute.displayName} / ${attributesAndOptions[1].attribute.displayName}`,
                    data: attributesAndOptions.map(({ attribute }) => attribute.data) as TA[]
                }

                this._options = this._getCombinedOptions([
                    attributesAndOptions[0].options,
                    attributesAndOptions[1].options,
                ])
            }
            else {
                throw new Error('Combining more than 2 attributes in a select is not supported.')
            }

            return this.builder
        }
    }

    private _getCombinedOptions(preCombinedOptions: VariableAttributeSelectOption<TO>[][]): VariableAttributeSelectOption<TO>[] {
        const combinedOptions: VariableAttributeSelectOption<TO>[] = []
        const matchingVariations: Product[] = []

        // Use the (2) options arrays to create a flattened array of options.

        preCombinedOptions.forEach((options) => {
            options.forEach((option) => {
                option.matchingVariations.forEach((matchingVariation) => {
                    if (!matchingVariations.find((p) => p._id === matchingVariation._id)) {
                        matchingVariations.push(matchingVariation)
                    }
                })
            })
        })

        matchingVariations.forEach((matchingVariation) => {
            const combinedOption: VariableAttributeSelectOption<TO> = {
                type: VariableAttributeSelectOptionType.Combination,
                sourceOptions: [],
                matchingVariations: [],
            }

            preCombinedOptions.forEach((options) => {
                options.forEach((option) => {
                    option.matchingVariations.forEach((matchingVar) => {
                        if (matchingVar === matchingVariation) {
                            combinedOption.sourceOptions.push(option)
                            if (!combinedOption.matchingVariations.find((mv) => mv._id === matchingVar._id)) {
                                combinedOption.matchingVariations.push(matchingVar)
                            }
                        }
                    })
                })
            })

            if (combinedOption.sourceOptions.length !== preCombinedOptions.length) {
                throw new Error('Length mismatch - the combined options could not be built.')
            }

            combinedOption.label = 'This is a combined option'

            combinedOptions.push(combinedOption)
        })

        return combinedOptions
    }

    // State selection and mutation.

    public get attribute(): VariableAttributeSelectAttribute<TA> {
        return this._attribute
    }

    public get options(): VariableAttributeSelectOption<TO>[] {
        return this._options
    }

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
        return this.state.allOptionsAreAvailable
            || !!this.getAvailableOptions().find((availableOption) => isEqual(option, availableOption))
    }

    public getAvailableOptions(): VariableAttributeSelectOption<TO>[] {

        const getAvailableOptions = (options: VariableAttributeSelectOption<TO>[]) => {
            return options.filter((option) => {

                // For each option, test whether any of the currently-matching variations has it.

                return this.state.matchingVariations.some((variation) => {

                    // If we're looking for an attribute value, test to see if any of the variation's
                    // `attributeValues` or `simpleAttributeValues` has a `value` equal to `option.data.value`.

                    const allAttributeValues = [
                        ...variation.attributeValues as AttributeValue[],
                        ...variation.simpleAttributeValues as SimpleAttributeValue[],
                    ]

                    if (this.type === VariableAttributeSelectType.Attribute) {
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

        if (this.type === VariableAttributeSelectType.Combination) {
            const availableOptions: VariableAttributeSelectOption<TO>[] = []

            this.options.forEach((combinedOption) => {
                const sourceOptions = combinedOption.sourceOptions
                if (getAvailableOptions(sourceOptions).length === sourceOptions.length) {
                    availableOptions.push(combinedOption)
                }
            })

            return availableOptions
        }
        else {
            return getAvailableOptions(this.options as VariableAttributeSelectOption<TO>[])
        }
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
