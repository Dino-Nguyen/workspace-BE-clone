import express from 'express';
import cardValidation from '../validations/card.validation.js';
import cardController from '../controllers/card.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { cardCoverStorage } from '../configs/cloudinary.config.js';
import multer from 'multer';

const cardRouter = express.Router();
const upload = multer({
  storage: cardCoverStorage,
  limits: { fieldSize: 5 * 1024 * 1024 },
});

cardRouter.post(
  '/',
  authMiddleware.verifyToken,
  cardValidation.createCard,
  cardController.createCard,
);

cardRouter.put(
  '/move-to-other-list',
  authMiddleware.verifyToken,
  cardController.moveCardsToOtherList,
);

cardRouter.post(
  '/search',
  authMiddleware.verifyToken,
  cardValidation.searchCards,
  cardController.searchCards,
);

cardRouter.get(
  '/weekly-done',
  authMiddleware.verifyToken,
  cardController.getWeeklyDoneCards,
);

cardRouter.get(
  '/weekly-new',
  authMiddleware.verifyToken,
  cardController.getWeeklyNewCards,
);

cardRouter.get(
  '/monthly',
  authMiddleware.verifyToken,
  cardController.getMonthlyDoneCards,
);

cardRouter.post(
  '/upload/:id',
  authMiddleware.verifyToken,
  upload.single('cover'),
  cardController.uploadImage,
);

cardRouter.put(
  '/:id',
  authMiddleware.verifyToken,
  cardValidation.updateCard,
  cardController.updateCard,
);

cardRouter.delete(
  '/:id',
  authMiddleware.verifyToken,
  cardController.deleteCard,
);

export default cardRouter;
