import { Document, model } from 'mongoose'
import { IAddress } from './address'

export interface PassportLocalDocument {
  createStrategy: Function
  serializeUser: Function
  deserializeUser: Function
}

export interface IUser extends Document, PassportLocalDocument {
  email: string
  emailIsVerified?: boolean
  emailVerificationToken?: string
  emailTokenExpires?: number
  password?: string
  passwordResetToken?: string
  passwordResetExpires?: string
  adminKey?: string

  lastName?: string
  firstName?: string
  avatar?: {
    large: string
    thumbnail: string
  }
  address?: IAddress
  phoneNumber?: string

  profile?: {
    age?: number
    gender?: string
    bio?: string
  }
  facebookId?: string
}