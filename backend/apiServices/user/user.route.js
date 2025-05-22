import express from 'express';
import authenticateToken from '../../middlewares/auth.middleware.js';
import { registerUser, loginUser, getUserInfo, setupMFA, verifyMFA } from './user.controller.js';

const userRouter = express.Router();

userRouter.get('/', (req, res) => {
  res.send('User route is working!');
});

userRouter.get('/profile', authenticateToken, getUserInfo);
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/mfa/setup', authenticateToken, setupMFA);
userRouter.post('/mfa/verify/:userId', verifyMFA);

export default userRouter;
