import express from 'express';
import chatValidation from '../validations/chat.validation.js';
import chatController from '../controllers/chat.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const chatRouter = express.Router();

chatRouter.post(
  '/',
  authMiddleware.verifyToken,
  chatValidation.createChat,
  chatController.createChat,
);

chatRouter.get('/', authMiddleware.verifyToken, chatController.getAllChats);

export default chatRouter;
