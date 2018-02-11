export class NavigationItem {
    public routerLink: string[]
    public text: string
    public children?: NavigationItem[]
    public showingChildren? = false

    constructor(item?: NavigationItem) {
        if (typeof item.routerLink !== 'undefined') this.routerLink = item.routerLink
        if (typeof item.text !== 'undefined') this.text = item.text
        if (typeof item.children !== 'undefined') this.children = item.children
        if (typeof item.showingChildren !== 'undefined') this.showingChildren = item.showingChildren
    }
}
