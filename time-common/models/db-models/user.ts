import mongoose from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import authConfig from '../../config/auth-config';

const usernameField = authConfig.MONGOOSE_USERNAME_FIELD;
const keylen = authConfig.PASSWORD_SALT_KEYLEN;

export const addressSchema = new mongoose.Schema({
  street1: String,
});

export const userSchema = new mongoose.Schema({
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
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose, { usernameField, keylen }); // Takes care of password salting/hashing

export const user = mongoose.model('User', userSchema);
