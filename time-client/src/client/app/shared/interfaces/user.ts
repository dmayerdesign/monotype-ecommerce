import { IAddress } from '../../../../../../time-common/models/interfaces';

export interface IUser {
  _id?: string;
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