import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import boardValidation from '../validations/board.validation.js';
import boardController from '../controllers/board.controller.js';

const boardRouter = express.Router();

boardRouter.post(
  '/',
  authMiddleware.verifyToken,
  boardValidation.createBoard,
  boardController.createBoard,
);

boardRouter.get(
  '/your-boards',
  authMiddleware.verifyToken,
  boardController.getYourBoards,
);

boardRouter.get(
  '/invited-boards',
  authMiddleware.verifyToken,
  boardController.getInvitedBoards,
);

boardRouter.get(
  '/progress',
  authMiddleware.verifyToken,
  boardController.getBoardProgress,
);

boardRouter.get(
  '/completed',
  authMiddleware.verifyToken,
  boardController.getCompletedBoards,
);

boardRouter.put(
  '/leave',
  authMiddleware.verifyToken,
  boardController.leaveBoard,
);

boardRouter.post(
  '/search',
  authMiddleware.verifyToken,
  boardController.searchBoard,
);

boardRouter.post(
  '/add-member',
  authMiddleware.verifyToken,
  boardController.addMember,
);

boardRouter.post(
  '/remove-member',
  authMiddleware.verifyToken,
  boardController.removeMember,
);

boardRouter.get(
  '/:id',
  authMiddleware.verifyToken,
  boardController.getBoardDetail,
);

boardRouter.put(
  '/:id',
  authMiddleware.verifyToken,
  boardValidation.updateBoard,
  boardController.updateBoard,
);

boardRouter.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.verifyOwner,
  boardController.deleteBoard,
);

export default boardRouter;
