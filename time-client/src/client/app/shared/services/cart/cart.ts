import { IProduct } from '@time/common/models/interfaces'

export class Cart {
    public count = 0
    public items: Array<IProduct> = []
    public get total(): number {
        return this.items
            .map(p => p.price.total)
            .reduce((prev: number, current: number) => {
                return prev + current
            }, 0)
    }
}
