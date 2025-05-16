import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
dotenv.config();

// Setup de la estrategia
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async function (accessToken, refreshToken, profile, done) {
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
    };
    return done(null, user);
  }
));

// Serialización
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
