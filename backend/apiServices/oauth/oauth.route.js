import express from 'express';
import passport from 'passport';

const oauthRouter = express.Router();

oauthRouter.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

oauthRouter.get('/google/callback', 
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    res.json({ success: true, user: req.user });
});

export default oauthRouter;
