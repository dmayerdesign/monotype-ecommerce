import * as mongoose from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import { Schema, Model, PassportLocalModel, PassportLocalSchema, PassportLocalDocument, model } from 'mongoose';
import authConfig from '../config/auth-config';
import { IUser } from './interfaces';
import { addressSchema } from '../../../../time-common/models/db-models';

const usernameField = authConfig.MONGOOSE_USERNAME_FIELD;
const keylen = authConfig.PASSWORD_SALT_KEYLEN;

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
  address: addressSchema,
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
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose, { usernameField, keylen }); // Takes care of password salting/hashing

export const User: PassportLocalModel<IUser> = (<PassportLocalModel<IUser>>model<IUser>('User', userSchema));
