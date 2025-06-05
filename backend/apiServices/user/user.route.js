import express from 'express';
import authenticateToken from '../../middlewares/auth.middleware.js';
import { registerUser, loginUser, loginGoogleUser, getUserInfo, setupMFA, deleteMFA, verifyMFA, searchUserController, getUserByIdController } from './user.controller.js';

const userRouter = express.Router();

userRouter.get('/', (req, res) => {
  res.send('User route is working!');
});

userRouter.get('/profile', authenticateToken, getUserInfo);
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/google/login', loginGoogleUser);
userRouter.post('/mfa/setup', authenticateToken, setupMFA);
userRouter.delete('/mfa/delete', authenticateToken, deleteMFA);
userRouter.post('/mfa/verify/:userId', verifyMFA);
userRouter.get('/search/:search', authenticateToken, searchUserController);
userRouter.get('/:userId', authenticateToken, getUserByIdController);

export default userRouter;
