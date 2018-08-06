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

export class VariableAttributeSelectState<OptionType extends AttributeValue = any> {
    public selectedOption?: VariableAttributeSelectOption<OptionType> = null
    public matchingVariations?: Product[] = []
    public availableOptions?: OptionType[]
    public wasFirstSelected? = false
    public allOptionsAreAvailable? = false
}

export interface VariableAttributeSelectAttribute<AttributeType> {
    slug: string
    displayName: string
    data: AttributeType | AttributeType[]
}

export interface VariableAttributeSelectOption<OptionType extends AttributeValue> {
    type?: VariableAttributeSelectOptionType
    label?: string
    data?: OptionType
    key?: string
    matchingVariations?: Product[]
    sourceOptions?: VariableAttributeSelectOption<OptionType>[]
}

export class VariableAttributeSelect<AttributeType extends string | Attribute = any, OptionType extends AttributeValue = any> extends Stateful<VariableAttributeSelectState> {
    public type: VariableAttributeSelectType
    public combination: VariableAttributeSelect<AttributeType, OptionType>[]
    protected _state = new VariableAttributeSelectState()
    private _productDetail: Product
    private _variations: Product[]
    private _attribute: VariableAttributeSelectAttribute<AttributeType>
    private _options: VariableAttributeSelectOption<OptionType>[]

    // Builder.

    public builder = {
        setProductDetail: (productDetail: Product) => {
            this._productDetail = productDetail
            this._variations = this._productDetail.variations as Product[]
            this.setState({ matchingVariations: [ ...this._variations ] })
            return this.builder
        },
        setAttributesOrProperties: (configs: {
            type: VariableAttributeSelectType
            attributeOrProperty: Attribute | string
        }[]) => {
            const attributesAndOptions: {
                attribute: VariableAttributeSelectAttribute<AttributeType>
                options: VariableAttributeSelectOption<OptionType>[]
            }[] = []

            configs.forEach(({ type, attributeOrProperty }) => {
                let attribute: VariableAttributeSelectAttribute<AttributeType>
                let options: VariableAttributeSelectOption<OptionType>[]

                // If it's a variable property:

                if (type === VariableAttributeSelectType.Property) {
                    attribute = {
                        slug: kebabCase(attributeOrProperty as string),
                        displayName: startCase(attributeOrProperty as string),
                        data: attributeOrProperty as AttributeType,
                    }

                    options = this._variations.reduce<VariableAttributeSelectOption<OptionType>[]>(
                        (_options, variation) => {
                            const data = variation[attribute.data as string]
                            let dataForDisplay = ''

                            if (typeof data === 'object') {
                                if (data.currency) {
                                    dataForDisplay = `${data.currency}`
                                }
                                if (data.amount) {
                                    dataForDisplay = `${dataForDisplay}${data.amount}`
                                }
                                if (data.unitOfMeasurement) {
                                    dataForDisplay = `${dataForDisplay}${data.unitOfMeasurement}`
                                }
                            }
                            else {
                                dataForDisplay = data
                            }

                            const existingOption = _options.find((option) => isEqual(option.data, data))
                            if (!existingOption) {
                                _options.push({
                                    type: VariableAttributeSelectOptionType.PropertyValue,
                                    label: dataForDisplay,
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
                        []
                    )
                }

                // If it's an Attribute:

                else if (type === VariableAttributeSelectType.Attribute) {
                    attribute = {
                        slug: (attributeOrProperty as Attribute).slug,
                        displayName: startCase((attributeOrProperty as Attribute).singularName || (attributeOrProperty as Attribute).slug),
                        data: attributeOrProperty as AttributeType
                    }

                    options = this._variations.reduce<VariableAttributeSelectOption<OptionType>[]>(
                        (_options, variation) => {
                            const allVariationAttributeValues: OptionType[] = [
                                ...variation.simpleAttributeValues as OptionType[],
                                ...variation.attributeValues as OptionType[],
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
                                                } as VariableAttributeSelectOption<OptionType>
                                            }
                                            else {
                                                existingOption.matchingVariations.push(variation)
                                            }
                                        }
                                    })
                            )
                            return _options.filter((x) => x != null)
                        },
                        []
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
                    displayName: `${startCase(attributesAndOptions[0].attribute.displayName)} / ${startCase(attributesAndOptions[1].attribute.displayName)}`,
                    data: attributesAndOptions.map(({ attribute }) => attribute.data) as AttributeType[]
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

    private _getCombinedOptions(preCombinedOptions: VariableAttributeSelectOption<OptionType>[][]): VariableAttributeSelectOption<OptionType>[] {
        const combinedOptions: VariableAttributeSelectOption<OptionType>[] = []
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
            const combinedOption: VariableAttributeSelectOption<OptionType> = {
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

            combinedOption.label = combinedOption.sourceOptions.map((srcOption) => srcOption.label).join(' / ')

            combinedOptions.push(combinedOption)
        })

        return combinedOptions
    }

    // State selection and mutation.

    public get attribute(): VariableAttributeSelectAttribute<AttributeType> {
        return this._attribute
    }

    public get options(): VariableAttributeSelectOption<OptionType>[] {
        return this._options
    }

    public set selectedOptionModel(selectedOption: VariableAttributeSelectOption<OptionType>) {
        this.select(selectedOption)
    }

    public get selectedOptionModel(): VariableAttributeSelectOption<OptionType> {
        return this.state.selectedOption
    }

    public select(selectedOption: VariableAttributeSelectOption<OptionType>): void {
        this.setState({ selectedOption })
    }

    public selectSilently(selectedOption: VariableAttributeSelectOption<OptionType>): void {
        this.setStateSilently({ selectedOption })
    }

    public get selectedOptionChanges(): Observable<VariableAttributeSelectOption<OptionType>> {
        return this.selectedOptionsSource.pipe(distinctUntilChanged())
    }

    public get selectedOptionsSource(): Observable<VariableAttributeSelectOption<OptionType>> {
        return this.states.pipe(
            map((state) => state.selectedOption),
        )
    }

    public optionIsAvailable(option: OptionType): boolean {
        return this.state.allOptionsAreAvailable
            || !!this.getAvailableOptions().find((availableOption) => isEqual(option, availableOption))
    }

    public getAvailableOptions(): VariableAttributeSelectOption<OptionType>[] {

        const getAvailableOptions = (options: VariableAttributeSelectOption<OptionType>[]) => {
            return options.filter((option) => {

                // Only return options whose data exists on at least one of the currently-matching in-stock variations.

                const someMatchingVariationsHaveOption = this.state.matchingVariations
                    .filter((variation) => variation.stockQuantity > 0)
                    .some((variation) => {

                        // If we're looking for an attribute value, test to see if any of the variation's
                        // `attributeValues` or `simpleAttributeValues` has a `value` equal to `option.data.value`.

                        const allAttributeValues = [
                            ...variation.attributeValues as AttributeValue[],
                            ...variation.simpleAttributeValues as SimpleAttributeValue[],
                        ]

                        if (option.type === VariableAttributeSelectOptionType.AttributeValue) {
                            const someAttributeValuesHaveValue = allAttributeValues
                                .some(({ value, attribute }) => {
                                    return (option.data.attribute as Attribute).slug === (attribute as Attribute).slug
                                        && option.data.value === value
                                })

                            return someAttributeValuesHaveValue
                        }

                        // If we're looking for a property value, loop through the parent product's
                        // `variableProperties` to get the variation's values for those property keys,
                        // and try to find one of those values that's equal to `option`.

                        const variableProperties = this._productDetail.variableProperties

                        if (option.type === VariableAttributeSelectOptionType.PropertyValue) {
                            const someVariablePropertiesEqualToOption = variableProperties
                                .map((key) => ({ key, value: variation[key] }))
                                .some(({ key, value }) => {
                                    return value === option.data
                                        && key === option.key
                                })

                            return someVariablePropertiesEqualToOption
                        }
                    })

                return someMatchingVariationsHaveOption
            })
        }

        if (this.type === VariableAttributeSelectType.Combination) {
            const availableOptions: VariableAttributeSelectOption<OptionType>[] = []

            this.options.forEach((combinedOption) => {
                const sourceOptions = combinedOption.sourceOptions

                if (getAvailableOptions(sourceOptions).length === sourceOptions.length) {
                    availableOptions.push(combinedOption)
                }
            })

            return availableOptions
        }
        else {
            return getAvailableOptions(this.options as VariableAttributeSelectOption<OptionType>[])
        }
    }

    // Update.

    public update(silent = false): void {
        const stateUpdate: VariableAttributeSelectState = {
            availableOptions: this.getAvailableOptions(),
        }

        if (stateUpdate.availableOptions.length === 1) {
            stateUpdate.selectedOption = stateUpdate.availableOptions[0]
        }

        if (silent) {
            this.setStateSilently(stateUpdate)
        }
        else {
            this.setState(stateUpdate)
        }
    }
}
