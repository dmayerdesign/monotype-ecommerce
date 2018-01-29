import { Document } from 'mongoose'

import { Cart } from '../../api-models/cart'
import { Image } from '../../api-models/image'
import { Order } from '../../api-models/order'
import { Address } from './address'

export interface User extends Document {
  email: string
  emailIsVerified?: boolean
  emailVerificationToken?: string
  emailTokenExpires?: number
  password?: string
  passwordResetToken?: string
  passwordResetExpires?: string
  role?: number

  name: string
  lastName: string
  firstName: string
  avatar: Image
  address: Address
  phoneNumber: string

  orders: (string|Order)[]
  stripeCustomerId: string

  cart: Cart
}
