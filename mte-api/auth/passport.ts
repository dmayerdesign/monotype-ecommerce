import * as passport from 'passport'
import * as FacebookStrategy from 'passport-facebook'

import { Copy, Types } from '@mte/common/constants'
import { User, UserModel } from '@mte/common/models/api-models/user'
import { bind, container } from '../config/inversify.config'
import { DbClient } from '../data-access/db-client'

const facebookStrategyConfig = {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.CLIENT_URL + '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name', 'displayName', 'gender', 'picture.type(large)']
}

export interface FacebookProfile {
    id: string
    emails: { value: string }[]
    name: { givenName: string, familyName: string }
    displayName: string
    gender: string
    picture: string
}

/**
 * Runs the passport configuration for user authentication via email + password and Facebook
 */
function _passportConfig(dbClient: DbClient<User>): void {

   /**
    * Configures facebook strategy
    */
    passport.use(new FacebookStrategy(facebookStrategyConfig, async (accessToken, refreshToken, profile, done) => {
        try {
            const localUser = await dbClient.findOne(UserModel, { email: profile.emails[0].value })

            if (localUser) {
                return done(Copy.ErrorMessages.userEmailExists)
            }

            const user = await dbClient.findOne(UserModel, { facebookId: profile.id })

            if (user) {
                return done(null, user)
            }

            const newUser = new UserModel(buildUserFromFacebookProfile(profile))

            try {
                const savedUser = await newUser.save()
                return done(null, savedUser)
            }
            catch (newUserError) {
                return done(newUserError)
            }
        }
        catch (findUserError) {
            return done(findUserError)
        }

    }))
}

function buildUserFromFacebookProfile(profile: FacebookProfile): User {
    return {
        lastName: profile.name.familyName,
        firstName: profile.name.givenName,
        name: profile.displayName,
        email: profile.emails[0].value,
        facebookId: profile.id,
        gender: profile.gender,
        avatar: {
            large: profile.picture,
            thumbnail: profile.picture,
        },
    }
}

export const passportConfig = bind(_passportConfig, [ Types.DbClient ])
