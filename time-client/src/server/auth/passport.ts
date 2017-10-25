import { NextFunction, Request, Response } from 'express'
import { injectable } from 'inversify'
import * as passport from 'passport'
import * as FacebookStrategy from 'passport-facebook'
import * as passportJWT from 'passport-jwt'

import { Copy } from '@time/common/constants'
import { User, UserModel } from '@time/common/models'

const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const facebookStrategyConfig = {
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.CLIENT_URL + '/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name', 'displayName', 'gender', 'picture.type(large)']
}

// export const jwtConfig = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('bearer'),
//     secretOrKey: process.env.JWT_SECRET,
// }

/**
 * Runs the passport configuration for user authentication via email + password and Facebook
 */
export function passportConfig() {

    // passport.use(new JwtStrategy(jwtConfig, (payload, next) => {

    //     // FOR TESTING
    //     console.log("Payload:", payload)
    //     if (payload.email) {
    //         next(null, payload)
    //     }
    //     /*
    //     User.findById(payload._id).then((user) => {
    //         if (user) {
    //             next(null, user)
    //         } else {
    //             next(user.errors, null)
    //         }
    //     })
    //     */
    // }))

   /**
    * Configures facebook strategy
    */
    passport.use(new FacebookStrategy(facebookStrategyConfig, (accessToken, refreshToken, profile, done) => {
        UserModel.findOne({ email: profile.emails[0].value }, (err, localUser) => {
            if (err) {
                return done(err)
            }
            if (localUser) {
                return done(Copy.ErrorMessages.userEmailExists)
            }

            UserModel.findOne({ facebookId: profile.id }, (findUserError, user) => {
                if (findUserError) return done(findUserError)
                if (user) return done(null, user)

                const newUser = new UserModel(buildUserFromFacebookProfile(profile))
                newUser.save((newUserError, savedUser) => {
                    if (newUserError) return done(newUserError)
                    return done(null, savedUser)
                })
            })
        })
    }))
}

function buildUserFromFacebookProfile(profile: any): any {
    return {
        lastName: profile.name.familyName,
        firstName: profile.name.givenName,
        email: profile.emails[0].value,
        facebookId: profile.id,
        profile: { gender: profile.gender },
        avatar: {
            large: profile.picture,
            thumbnail: profile.picture,
        },
    }
}
