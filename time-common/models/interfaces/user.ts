import { model, Document } from 'mongoose'
import { IAddress } from './address'

export interface IUser extends Document {
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

export interface ILogin {
  email: string
  password: string
}

export interface IAuthResponse {
  authToken: string
}
