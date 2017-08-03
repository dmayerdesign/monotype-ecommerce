import { Schema, Model, model } from 'mongoose';
import authConfig from '../../../time-client/src/server/config/auth-config';
import { IUser } from '../interfaces';
import { addressSchema } from './';
const passportLocalMongoose = require('passport-local-mongoose');

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

// export class UserModel<T> extends Model<T> {
//   createStrategy: () => any;
//   serializeUser: () => any;
//   deserializeUser: () => any;

//   constructor() {
//     super();
//   }
// }

userSchema.plugin(passportLocalMongoose, { usernameField, keylen }); // Takes care of password salting/hashing

export const User: Model<IUser> = model('User', userSchema);
export default model('User', userSchema);