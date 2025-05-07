import express from 'express';
import { registerUser, loginUser, setupMFA, verifyMFA } from './user.controller.js';

const userRouter = express.Router();

userRouter.get('/', (req, res) => {
  res.send('User route is working!');
});

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/mfa/setup/:userId', setupMFA);
userRouter.post('/mfa/verify/:userId', verifyMFA);

export default userRouter;
