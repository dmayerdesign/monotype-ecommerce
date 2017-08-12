import { injectable } from 'inversify';
import * as passport from 'passport';
import * as passportFacebook from 'passport-facebook';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { IUser } from '../models/interfaces';
import { handleError } from '@time/api-utils';
import CONSTANTS from '@time/constants';

const FacebookStrategy = passportFacebook.Strategy;

const facebookStrategyConfig = {
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.CLIENT_URL + '/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name', 'displayName', 'gender', 'picture.type(large)']
};

/**
 * Runs the passport configuration for user authentication via email + password and Facebook
 */
export function passportConfig() {
  /**
   * Configures local strategy
   */
  passport.use(User.createStrategy());

  /**
   * Configures session
   */
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  /**
   * Configures facebook strategy
   */
  passport.use(new FacebookStrategy(facebookStrategyConfig, (accessToken, refreshToken, profile, done) => {
      User.findOne({ email: profile.emails[0].value }, (err, localUser) => {
        if (err) {
          return done(err);
        }
        if (localUser) {
          return done(CONSTANTS.ERRORS.userEmailExists);
        }

        User.findOne({ facebookId: profile.id }, (err, user) => {
          if (err) throw err;
          if (user) return done(null, user);

          const newUser = new User(buildUserFromFacebookProfile(profile));
          newUser.save((error, user) => {
            if (error) throw error;
            return done(null, user);
          });
        });
      });
    }
  ));

  /**
   * Gets Facebook profile for signup
   */
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.CLIENT_URL + '/home?fbsignup=true', // '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name', 'displayName', 'gender', 'picture.type(large)']
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOne({ $or: [ { email: profile.emails[0].value }, { facebookId: profile.id } ] }, (err, user) => {
      if (err) {
        console.log(err, user);
        return done("Something went wrong. Please try again.");
      }
      if (user) {
        console.log(user);
        return done("An account with that email already exists.");
      }

      let newUser = {
        name: profile.displayName,
        lastName: profile.name.familyName,
        firstName: profile.name.givenName,
        email: profile.emails[0].value,
        facebookId: profile.id,
        profile: { gender: profile.gender },
        avatar: profile.picture,
      };

      done(null, newUser);
    });
  }));
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