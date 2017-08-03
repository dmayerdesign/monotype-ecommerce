import { Document } from 'mongoose';
import { IAddress } from './';

export interface IUser extends Document {
  email: string;
  emailIsVerified?: boolean;
  emailVerificationToken?: string;
  emailTokenExpires?: number;
  username?: string;
  password?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  adminKey?: string;

  lastName?: string;
  firstName?: string;
  avatar?: {
    large: string;
    thumbnail: string;
  };
  address?: IAddress;
  phoneNumber?: string;

  profile?: {
    age?: number;
    gender?: string;
    bio?: string;
  };
  facebookId?: string;

  tookTour?: boolean;
}