import { model, Document } from 'mongoose'

import { IAddress } from './address'
import { ICart } from './cart'

export interface IUser extends Document {
  email: string
  emailIsVerified?: boolean
  emailVerificationToken?: string
  emailTokenExpires?: number
  password?: string
  passwordResetToken?: string
  passwordResetExpires?: string
  adminKey?: string

  name: string
  lastName: string
  firstName: string
  avatar: {
    large: string
    thumbnail: string
  },
  // address: addressSchema,
  phoneNumber: string

  profile: {
    age: number
    gender: string
    bio: string
  },
  facebookId: string
  googleId: string

  orders: string[]
  stripeCustomerId: string

  cart: ICart

  customFields: {}
}
