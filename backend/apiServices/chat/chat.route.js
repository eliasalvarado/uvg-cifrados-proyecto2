import express from 'express';
import { createGroupController, getGroupChatsController, getSingleChatsController, joinGroupController, sendGroupMessageController, sendMessageController } from './chat.controller.js';
import authenticateToken from '../../middlewares/auth.middleware.js';
import readOnlyGuard from '../../middlewares/readOnly.middleware.js';


const chatRouter = express.Router();

chatRouter.get('/single', authenticateToken, getSingleChatsController);
chatRouter.post('/single/:userId',authenticateToken,readOnlyGuard, sendMessageController);
chatRouter.post('/group',authenticateToken, readOnlyGuard,  createGroupController);
chatRouter.post('/group/join',authenticateToken, readOnlyGuard, joinGroupController);
chatRouter.post('/group/:groupId',authenticateToken, readOnlyGuard, sendGroupMessageController);
chatRouter.get('/group',authenticateToken, getGroupChatsController);

export default chatRouter;
