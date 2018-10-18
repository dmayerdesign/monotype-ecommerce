import { Injectable } from '@angular/core'
import { Attribute } from '@mte/common/api/interfaces/attribute'
import { AttributeValue } from '@mte/common/api/interfaces/attribute-value'
import { Price } from '@mte/common/api/interfaces/price'
import { ProductsFilter } from '@mte/common/api/interfaces/products-filter'
import { Taxonomy } from '@mte/common/api/interfaces/taxonomy'
import { TaxonomyTerm } from '@mte/common/api/interfaces/taxonomy-term'
import { GetProductsFilter, GetProductsFilterType, GetProductsRequest } from '@mte/common/api/requests/get-products.request'
import { ProductsFilterType } from '@mte/common/constants/enums/products-filter-type'
import { MongooseHelper } from '@mte/common/helpers/mongoose.helper'
import { MteFormGroupOptions } from '@mte/common/lib/ng-modules/forms/models/form-group-options'
import { MteFormBuilderService } from '@mte/common/lib/ng-modules/forms/services/form-builder.service'
import { MteFormBuilder } from '@mte/common/lib/ng-modules/forms/utilities/form.builder'
import { Store } from '@ngrx/store'
import { camelCase, isEqual, kebabCase } from 'lodash'
import { Observable, Subject } from 'rxjs'
import { filter, map, take } from 'rxjs/operators'
import { OrganizationService } from '../../services/organization.service'
import { AppState } from '../../state/app.state'
import { ProductsFilterFormData } from '../containers/products/products.component'
import { GetProductsRequestUpdate, ProductsFilterFormBuildersUpdate } from '../shop.actions'
import { selectGetProductsRequest, selectProducts } from '../shop.selectors'
import { ProductService } from './product.service'

@Injectable()
export class ProductsFiltersService {
    private _productsFilterFormBuildersShowingSubject = new Subject<MteFormBuilder[]>()
    private _taxonomyTerm: TaxonomyTerm
    private _productsFilterFormBuilders: MteFormBuilder[]
    private _productsFilterFormValuesMap = new Map<ProductsFilter, any>()
    private _shouldExecuteRequestOnFormValueChanges = false
    private _existingFilterFinderMap = new Map<
        ProductsFilterType,
        (productsFilter?: ProductsFilter) => (getProductsFilter: GetProductsFilter) => boolean
    >()
    private _formGroupOptionsFactoryMap = new Map<
        ProductsFilterType,
        (productsFilter?: ProductsFilter) => MteFormGroupOptions
    >()
    private _newRequestFilterFactoryMap = new Map<ProductsFilterType, (formValue: any) => GetProductsFilter>()
    private _priceRange: Price[]
    public productsFilterFormBuildersStream: Observable<MteFormBuilder[]>

    constructor(
        private _store: Store<AppState>,
        private _mteFormBuilderService: MteFormBuilderService,
        private _organizationService: OrganizationService,
        private _productService: ProductService,
    ) {
        this._store
            .pipe(selectProducts)
            .subscribe((productsState) => {
                this._taxonomyTerm = productsState.taxonomyTerm
                this._productsFilterFormBuilders = productsState.productsFilterFormBuilders
            })

        this._productService.getPriceRange()
            .then((priceRange) => {
                this._updateFormSilently(() => {
                    this._priceRange = priceRange
                    const priceRangeFormBuilder = this._productsFilterFormBuilders.find((mteFormBuilder) =>
                        !!mteFormBuilder.formGroup.get('priceRange'))
                    if (priceRangeFormBuilder) {
                        priceRangeFormBuilder.formGroup.get('priceRange').setValue(
                            this._priceRange.map((price) => price.amount)
                        )
                    }
                })
            })

        // Register handler functions to handle value changes to the filter forms.

        // ...for `TaxonomyTermChecklist`s.
        this._registerExistingFilterFinder(ProductsFilterType.TaxonomyTermChecklist,
            (productsFilter) =>
                (getProductsFilter) =>
                    getProductsFilter.values && getProductsFilter.values.some((filterValue) =>
                        productsFilter.taxonomyTermOptions.some((taxonomyTerm: TaxonomyTerm) =>
                            filterValue === taxonomyTerm.slug)))
        this._registerFormGroupOptionsFactory(ProductsFilterType.TaxonomyTermChecklist,
            (productsFilter) => {
                const formGroupOptions: MteFormGroupOptions = {}
                productsFilter.taxonomyTermOptions.forEach((taxonomyTerm: TaxonomyTerm) => {
                    formGroupOptions[camelCase(taxonomyTerm.slug)] = {
                        defaultValue: false,
                        label: taxonomyTerm.singularName || taxonomyTerm.slug,
                        formControlType: 'checkbox',
                    }
                })
                return formGroupOptions
            })
        this._registerNewRequestFilterFactory(ProductsFilterType.TaxonomyTermChecklist, (formValue) => {
            return {
                type: GetProductsFilterType.TaxonomyTerm,
                values: Object.keys(formValue)
                    .filter((key) => !!formValue[key])
                    .map((key) => kebabCase(key))
            }
        })

        // ...for `AttributeValueChecklist`s.
        this._registerExistingFilterFinder(ProductsFilterType.AttributeValueChecklist,
            (productsFilter) =>
                (getProductsFilter) =>
                    getProductsFilter.values && getProductsFilter.values.some((filterValue) =>
                        productsFilter.attributeValueOptions.some((attributeValue: AttributeValue) =>
                            filterValue === attributeValue.slug)))
        this._registerFormGroupOptionsFactory(ProductsFilterType.AttributeValueChecklist,
            (productsFilter) => {
                const formGroupOptions: MteFormGroupOptions = {}
                productsFilter.attributeValueOptions.forEach((attributeValue: AttributeValue) => {
                    formGroupOptions[camelCase(attributeValue.slug)] = {
                        defaultValue: false,
                        label: attributeValue.name || attributeValue.slug,
                        formControlType: 'checkbox',
                    }
                })
                return formGroupOptions
            })
        this._registerNewRequestFilterFactory(ProductsFilterType.AttributeValueChecklist, (formValue) => {
            return {
                type: GetProductsFilterType.AttributeValue,
                values: Object.keys(formValue)
                    .filter((key) => !!formValue[key])
                    .map((key) => kebabCase(key))
            }
        })

        // ...for `PriceRange`.
        this._registerExistingFilterFinder(ProductsFilterType.PriceRange,
            () =>
                (getProductsFilter) =>
                    getProductsFilter.type === GetProductsFilterType.Property &&
                    !!getProductsFilter.range &&
                    getProductsFilter.key === 'price')
        this._registerFormGroupOptionsFactory(ProductsFilterType.PriceRange, () => {
            const formGroupOptions: MteFormGroupOptions = {}
            formGroupOptions.priceRange = {
                label: 'Price range',
                formControlType: 'input',
                defaultValue: [0, 1000]
            }
            return formGroupOptions
        })
        this._registerNewRequestFilterFactory(ProductsFilterType.PriceRange, (formValue) => {
            return {
                type: GetProductsFilterType.Property,
                key: 'price',
                range: formValue.priceRange
            }
        })

        // Now, set up the filters.

        this._initFilters()

        this.productsFilterFormBuildersStream = this._store.pipe(
            selectGetProductsRequest,
            map((getProductsRequest) =>
                this._productsFilterFormBuilders.filter((formBuilder) =>
                    this._shouldDisplayProductsFilter(
                        formBuilder.data.productsFilter,
                        getProductsRequest,
                    )
                )
            )
        )
    }

    // Public API.

    public getFiltersForRequest(getProductsRequest: GetProductsRequest): MteFormBuilder[] {
        return this._productsFilterFormBuilders.filter((formBuilder) =>
            this._shouldDisplayProductsFilter(
                formBuilder.data.productsFilter,
                getProductsRequest,
            )
        )
    }

    public isChecklist(productsFilter: ProductsFilter): boolean {
        return productsFilter.filterType === ProductsFilterType.TaxonomyTermChecklist ||
            productsFilter.filterType === ProductsFilterType.AttributeValueChecklist
    }

    public isPriceRange(productsFilter: ProductsFilter): boolean {
        return productsFilter.filterType === ProductsFilterType.PriceRange
    }

    public get priceRange(): Price[] {
        return this._priceRange
    }

    // Logic.

    private _getFormBuildersForProductsFilters(productsFilters: ProductsFilter[]): MteFormBuilder<ProductsFilterFormData>[] {
        return MongooseHelper.toArray<ProductsFilter>(productsFilters)
            .filter((productsFilter) => productsFilter.enabled)
            .map((productsFilter) => {
                let mteFormBuilder: MteFormBuilder<ProductsFilterFormData>
                let taxonomy: Taxonomy
                let attribute: Attribute

                if (
                    productsFilter.filterType === ProductsFilterType.TaxonomyTermChecklist &&
                    productsFilter.taxonomyTermOptions.length
                ) {
                    taxonomy = (productsFilter.taxonomyTermOptions[0] as TaxonomyTerm).taxonomy as Taxonomy
                }

                if (
                    productsFilter.filterType === ProductsFilterType.AttributeValueChecklist &&
                    productsFilter.attributeValueOptions.length
                ) {
                    attribute = (productsFilter.attributeValueOptions[0] as AttributeValue).attribute as Attribute
                }

                // Create the form.

                mteFormBuilder = this._mteFormBuilderService.create<ProductsFilterFormData>(
                    this._formGroupOptionsFactoryMap.get(productsFilter.filterType)(productsFilter)
                )

                // Attach useful data to the form builder for convenience.

                mteFormBuilder.data = {
                    attribute,
                    taxonomy,
                    productsFilter,
                }

                return mteFormBuilder
            })
    }

    private _initFilters(): void {
        const { storeUiSettings } = this._organizationService.organization

        this._store.dispatch(new ProductsFilterFormBuildersUpdate(
            this._getFormBuildersForProductsFilters(storeUiSettings.productsFilters)
        ))

        this._store
            .pipe(
                selectProducts,
                map((productsState) => productsState.getProductsRequest),
                take(1),
            )
            .subscribe((getProductsRequest) => {
                this._updateFilterFormsFromRequest(getProductsRequest)
            })
    }

    private _shouldDisplayProductsFilter(
        productsFilter: ProductsFilter,
        getProductsRequest: GetProductsRequest,
    ): boolean {
        if (productsFilter.displayAlways) return true

        // Display when a particular taxonomy term is included in the request.
        // TODO: Support conditions other than taxonomy terms.

        const expectedTaxonomyTermSlug = productsFilter.displayWhen.taxonomyTermSlug
        if (typeof expectedTaxonomyTermSlug !== 'undefined') {
            const requestFilters = getProductsRequest.filters

            // If we're in a taxonomy term view, we just need to check if the taxonomy term matches
            // the one we expect.

            return (this._taxonomyTerm && expectedTaxonomyTermSlug === this._taxonomyTerm.slug) ||

                // Otherwise, we need to check if there are any filters present in the request.

                (
                    !requestFilters ||
                    !requestFilters.length ||

                    // If there are filters present, check if there are any TaxonomyTerm filters.
                    // If not, then it's OK to display the filter.

                    !requestFilters.find((getProductsFilter) =>
                        getProductsFilter.type === GetProductsFilterType.TaxonomyTerm
                    ) ||

                    // If there are TaxonomyTerm filters present, THEN we need to validate that
                    // at least one of them matches our expected taxonomy term.

                    !!requestFilters.find((getProductsFilter) =>
                        getProductsFilter.type === GetProductsFilterType.TaxonomyTerm &&
                        getProductsFilter.values.find((taxonomyTermSlug) =>
                            taxonomyTermSlug === expectedTaxonomyTermSlug
                        )
                    )
                )
        }
        return true
    }

    private _updateFilterFormsFromRequest(getProductsRequest: GetProductsRequest): void {
        this._updateFormSilently(() => {
            if (getProductsRequest.filters) {
                getProductsRequest.filters.forEach((filter) => {
                    if (!!filter.values) {
                        filter.values
                            .filter((filterValue) => typeof filterValue === 'string')
                            .forEach((filterValue) => {
                                this._productsFilterFormBuilders
                                    .map((formBuilder) => formBuilder.formGroup)
                                    .forEach((formGroup) => {
                                        const formControlName = camelCase(filterValue)
                                        if (formGroup.get(formControlName)) {
                                            formGroup.patchValue({
                                                [formControlName]: true
                                            })
                                        }
                                    })
                            })
                    }
                    if (!!filter.range) {
                        const formControlName = camelCase(filter.key)
                        const formControl = this._productsFilterFormBuilders
                            .map((formBuilder) => formBuilder.formGroup)
                            .find((formGroup) => !!formGroup.get(formControlName))
                        if (formControl) {
                            formControl.patchValue({
                                [formControlName]: filter.range,
                            })
                        }
                    }
                })
            }
        })
    }

    private _registerExistingFilterFinder(
        type: ProductsFilterType,
        finderFn: (productsFilter?: ProductsFilter) => (getProductsFilter: GetProductsFilter) => boolean
    ): void {
        this._existingFilterFinderMap.set(type, finderFn)
    }

    private _registerFormGroupOptionsFactory(
        type: ProductsFilterType,
        formGroupOptionsFactory: (productsFilter?: ProductsFilter) => MteFormGroupOptions
    ): void {
        this._formGroupOptionsFactoryMap.set(type, formGroupOptionsFactory)
    }

    private _registerNewRequestFilterFactory(
        type: ProductsFilterType,
        newRequestFilterFactory: (formValue: any) => GetProductsFilter
    ): void {
        this._newRequestFilterFactoryMap.set(type, newRequestFilterFactory)
    }

    private _updateFormSilently(formUpdateFn: (...args: any[]) => any): void {
        this._shouldExecuteRequestOnFormValueChanges = false
        formUpdateFn()
        setTimeout(() => {
            this._shouldExecuteRequestOnFormValueChanges = true
        }, 100)
    }
}
