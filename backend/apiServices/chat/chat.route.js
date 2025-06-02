import express from 'express';
import { getSingleChatsController, sendMessageController } from './chat.controller.js';
import authenticateToken from '../../middlewares/auth.middleware.js';

const chatRouter = express.Router();

chatRouter.get('/single', authenticateToken, getSingleChatsController);
chatRouter.post('/single/:userId',authenticateToken, sendMessageController);

export default chatRouter;
