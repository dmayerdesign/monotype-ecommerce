import * as passport from 'passport';
import * as passportFacebook from 'passport-facebook';
import User from '../../../../time-common/models/db-models/user';

const FacebookStrategy = passportFacebook.Strategy;

export function passportConfig() {

  /**
   * Configure local strategy
   */
  passport.use((<any>User).createStrategy());

  /**
   * Configure session
   */
  passport.serializeUser((<any>User).serializeUser());
  passport.deserializeUser((<any>User).deserializeUser());

  /**
   * Get Facebook profile for signup
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

/*
 * Login Required middleware.
 */
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user.emailIsVerified) {
    return next();
  }
  else if (req.isAuthenticated() && !req.user.emailIsVerified) {
    res.status(403).json({error: "Account not yet verified"});
    console.error("Account not yet verified");
    return;
  }
  res.status(401).json({error: "User authentication error"});
  console.log("User not authenticated");
};

/*
 * Check admin role
 */
export const isAuthorized = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.adminKey === process.env.ADMIN_KEY) {
      return next();
    }
    else {
      res.status(401).json({error: "User not authorized"});
      console.log("User not authorized");
    }
  }
  else {
    res.status(401).json({error: "User authentication error"});
    console.log("User not authenticated");
  }
};