import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { getUserByEmail, createGoogleUser } from './oauth.model.js';
dotenv.config();

// Setup de la estrategia
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/oauth/google/callback"
  },
  async function (accessToken, refreshToken, profile, done) {

    console.log("Perfil de Google:", profile);

    // Verificar si el usuario ya existe en la base de datos
    const existingUser = await getUserByEmail(profile.emails[0].value);

    if (existingUser) {
      // Si el usuario ya existe, devolverlo
      return done(null, existingUser);
    }

    try {
      // Si el usuario no existe, crear uno nuevo
      const userId = await createGoogleUser({
        email: profile.emails[0].value,
        googleId: profile.id
      });
    
      // Devolver el nuevo usuario
      const createdUser = await getUserByEmail(profile.emails[0].value);
      return done(null, createdUser);

    } catch (error) {
      console.error("Error al crear el usuario de Google:", error);
      return done(error, null);
    }
  }
));

// Serialización
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
