import express from 'express';
import { registerUser, loginUser } from './user.controller.js';

const userRouter = express.Router();

userRouter.get('/', (req, res) => {
  res.send('User route is working!');
});

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

export default userRouter;
