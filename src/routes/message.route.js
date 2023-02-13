import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import messageValidation from '../validations/message.validation.js';
import messageController from '../controllers/message.controller.js';

const messageRouter = express.Router();

messageRouter.post(
  '/',
  authMiddleware.verifyToken,
  messageValidation.createMessage,
  messageController.createMessage,
);

export default messageRouter;
