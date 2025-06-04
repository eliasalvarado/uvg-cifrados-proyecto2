import express from 'express';
import { createGroupController, getSingleChatsController, joinGroupController, sendMessageController } from './chat.controller.js';
import authenticateToken from '../../middlewares/auth.middleware.js';

const chatRouter = express.Router();

chatRouter.get('/single', authenticateToken, getSingleChatsController);
chatRouter.post('/single/:userId',authenticateToken, sendMessageController);
chatRouter.post('/group',authenticateToken, createGroupController);
chatRouter.post('/group/join',authenticateToken, joinGroupController);

export default chatRouter;
