import { ShopRoutePaths } from './shop-route-paths'

export class ShopRouterLinks {
    public static readonly checkout = `/${ShopRoutePaths.shop}/${ShopRoutePaths.checkout}`
    public static readonly cart = `/${ShopRoutePaths.shop}/${ShopRoutePaths.cart}`
    public static readonly shopHome = `/${ShopRoutePaths.shop}`
    public static readonly shopAll = `/${ShopRoutePaths.shop}/${ShopRoutePaths.shopAll}`
    public static readonly productDetail = (slug: string) => `/${ShopRoutePaths.productDetail.replace(':slug', slug)}`
}
