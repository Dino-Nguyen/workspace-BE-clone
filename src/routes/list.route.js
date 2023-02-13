import express from 'express';
import listValidation from '../validations/list.validation.js';
import listController from '../controllers/list.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const listRouter = express.Router();

listRouter.post(
  '/',
  authMiddleware.verifyToken,
  listValidation.createList,
  listController.createList,
);

listRouter.put(
  '/:id',
  authMiddleware.verifyToken,
  listValidation.updateList,
  listController.updateList,
);

listRouter.delete(
  '/:id',
  authMiddleware.verifyToken,
  listController.deleteList,
);

export default listRouter;
