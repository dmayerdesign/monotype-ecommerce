import { createFeatureSelector, createSelector, select } from '@ngrx/store'
import { AppState } from '../state/app.state'
import { ShopState } from './shop.state'

export const shopSelectorKey = 'shop'

export const shopSelector = createFeatureSelector<AppState, ShopState>(
    shopSelectorKey,
)

export const productsSelector = createSelector(
    shopSelector,
    (shopState) => shopState.products
)

export const getProductsRequestSelector = createSelector(
    productsSelector,
    (productsState) => productsState.getProductsRequest
)

export const selectShop = select(shopSelector)
export const selectProducts = select(productsSelector)
export const selectGetProductsRequest = select(getProductsRequestSelector)

