import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const oauthRouter = express.Router();

oauthRouter.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

oauthRouter.get('/google/callback', 
  passport.authenticate('google', {
    failureRedirect: '/',
    session: false
  }),
  (req, res) => {
    // Generar token JWT, con una expiración de 1 hora
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Redirigir al cliente con el token
    res.redirect(`http://localhost:5173/oauth/success?token=${token}`);
});

export default oauthRouter;
