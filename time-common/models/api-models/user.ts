import { arrayProp, prop, Ref, Typegoose } from 'typegoose'

import { Address } from './address'
import { Cart } from './cart'
import { Image } from './image'
import { Order } from './order'

export class User extends Typegoose {
    @prop({ required: true }) public email: string
    @prop() public emailIsVerified?: boolean
    @prop() public emailVerificationToken?: string
    @prop() public emailTokenExpires?: number
    @prop() public password?: string
    @prop() public passwordResetToken?: string
    @prop() public passwordResetExpires?: string
    @prop() public adminKey?: string

    @prop() public name: string
    @prop() public lastName: string
    @prop() public firstName: string
    @prop() public avatar: Image
    @prop() public address: Address
    @prop() public phoneNumber: string

    @prop() public facebookId: string
    @prop() public googleId: string

    @arrayProp({ itemsRef: Order }) public orders: Ref<Order>[]
    @prop() public stripeCustomerId: string

    @prop() public cart: Cart

    @prop() public customFields: {}
}

export const UserModel = new User().getModelForClass(User, { schemaOptions: { timestamps: true } })
