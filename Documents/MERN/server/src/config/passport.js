const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

/**
 * Serialize user for session
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

/**
 * Configure Google OAuth Strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({
          'socialAccounts.provider': 'google',
          'socialAccounts.providerId': profile.id,
        });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.socialAccounts.push({
            provider: 'google',
            providerId: profile.id,
            avatar: profile.photos[0]?.value,
          });
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos[0]?.value,
          role: 'customer',
          isEmailVerified: true,
          socialAccounts: [
            {
              provider: 'google',
              providerId: profile.id,
              avatar: profile.photos[0]?.value,
            },
          ],
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

/**
 * Configure Facebook OAuth Strategy
 */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({
          'socialAccounts.provider': 'facebook',
          'socialAccounts.providerId': profile.id,
        });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        if (profile.emails && profile.emails[0]) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Facebook account to existing user
            user.socialAccounts.push({
              provider: 'facebook',
              providerId: profile.id,
              avatar: profile.photos[0]?.value,
            });
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        user = await User.create({
          email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos[0]?.value,
          role: 'customer',
          isEmailVerified: true,
          socialAccounts: [
            {
              provider: 'facebook',
              providerId: profile.id,
              avatar: profile.photos[0]?.value,
            },
          ],
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;
