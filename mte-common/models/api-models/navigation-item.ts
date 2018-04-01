import { TemplateRef } from '@angular/core'
import { arrayProp, prop, MongooseDocument, MongooseSchemaOptions, Ref } from '../../lib/goosetype'

/**
 * A navigation item to be displayed in the UI
 * @description DO NOT "new up" this class from within a browser application. Default values are meant only to convey intent.
 * @export
 * @class NavigationItem
 * @extends {MongooseDocument}
 */
export class NavigationItem extends MongooseDocument {
    @prop() public text: string
    @prop() public isTopLevel? = true
    @arrayProp({ items: String }) public routerLink: string[]
    @arrayProp({ itemsRef: NavigationItem }) public children: Ref<NavigationItem>[]

    public template: TemplateRef<any>
    public context: any
}

export const NavigationItemModel = new NavigationItem().getModel()

export class CreateNavigationItemError extends Error { }
export class FindNavigationItemError extends Error { }
export class UpdateNavigationItemError extends Error { }
export class DeleteNavigationItemError extends Error { }
