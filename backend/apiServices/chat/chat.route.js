import express from 'express';
import {  getChatsListController } from './chat.controller.js';

const chatRouter = express.Router();

chatRouter.get('/', getChatsListController);

export default chatRouter;
