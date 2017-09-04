import { IAddress } from '../interfaces';

export class UserBuilder {
  email: string;
  username?: string;
  password?: string;
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

  constructor(user?: any, includePassword?: boolean) {
    if (user) {
      this.email = user.email;
      this.username = user.username;
      this.lastName = user.lastName;
      this.firstName = user.firstName;
      this.avatar = user.avatar;
      this.address = user.address;
      this.phoneNumber = user.phoneNumber;
      this.profile = user.profile;
      this.facebookId = user.facebookId;
      
      if (includePassword) {
        this.password = user.password;
      }
    }
  }
}