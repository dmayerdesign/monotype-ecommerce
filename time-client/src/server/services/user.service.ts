import { inject, injectable } from 'inversify';
import { IUser } from '../../../../time-common/models/interfaces';
import { User } from '../../../../time-common/models/db-models/user';
import TYPES from '../constants/inversify/types';

@injectable()
export class UserService {

    public getUser(id: string): Promise<IUser> {
        return new Promise<IUser>((resolve, reject) => {
            User.findById(id, (error, data: IUser): void => {
                if (error) reject(error);
                else resolve(data);
            });
        });
    }

    public newUser(user: IUser): Promise<IUser> {
        return new Promise<IUser>((resolve, reject) => {
            const theUser = new User(user);
            theUser.save((error, data: IUser): void => {
                if (error) reject(error);
                else resolve(data);
            });
        });
    }

    public updateUser(id: string, user: IUser): Promise<IUser> {
        return new Promise<IUser>((resolve, reject) => {
            User.findByIdAndUpdate(id, user, { new: true }, (error, data) => {
                if (error) reject(error);
                else resolve(data);
            });
        });
    }

    public deleteUser(id: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            User.findByIdAndRemove(id, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
}
