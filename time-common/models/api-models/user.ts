import * as mongoose from 'mongoose'
import { model, Schema } from 'mongoose'
import { IUser } from '../interfaces'
import { addressSchema } from './address'

export const userSchema: Schema = new Schema({
  email: { type: String, required: true },
  emailIsVerified: Boolean,
  emailVerificationToken: String,
  emailTokenExpires: Number,
  username: { type: String, unique: true },
  passwordResetToken: String,
  passwordResetExpires: Date,
  adminKey: String,

  name: String,
  lastName: String,
  firstName: String,
  avatar: {
    large: String,
    thumbnail: String,
  },
  // address: addressSchema,
  phoneNumber: String,

  profile: {
    age: Number,
    gender: String,
    bio: String,
  },
  facebookId: String,
  googleId: String,

  orders: [String],
  stripeCustomerId: String,

  cart: [{
    SKU: String,
    quantity: Number,
    unitCost: Number,
    totalCost: Number,
  }],
}, { timestamps: true })

export const User = model<IUser>('User', userSchema)
