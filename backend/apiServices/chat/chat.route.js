import express from 'express';
import {  getChatsListController, sendMessageController } from './chat.controller.js';
import authenticateToken from '../../middlewares/auth.middleware.js';

const chatRouter = express.Router();

chatRouter.get('/', getChatsListController);
chatRouter.post('/single/:userId',authenticateToken, sendMessageController);

export default chatRouter;
