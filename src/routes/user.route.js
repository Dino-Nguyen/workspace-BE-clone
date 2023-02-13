import express from 'express';
import userValidation from '../validations/user.validation.js';
import userController from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  avatarStorage,
  coverPhotoStorage,
} from '../configs/cloudinary.config.js';
import multer from 'multer';

const userRouter = express.Router();
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fieldSize: 5 * 1024 * 1024 },
});
const uploadCoverPhoto = multer({
  storage: coverPhotoStorage,
  limits: { fieldSize: 5 * 1024 * 1024 },
});

userRouter.post('/sign-up', userValidation.signUp, userController.signUp);
userRouter.post('/sign-in', userValidation.signIn, userController.signIn);
userRouter.put(
  '/user/update',
  authMiddleware.verifyToken,
  userValidation.updateUser,
  userController.updateUser,
);
userRouter.put(
  '/user/change-password',
  authMiddleware.verifyToken,
  userValidation.changePassword,
  userController.changePassword,
);
userRouter.post(
  '/user/upload-avatar',
  authMiddleware.verifyToken,
  uploadAvatar.single('avatar'),
  userController.uploadAvatar,
);
userRouter.post(
  '/user/upload-cover',
  authMiddleware.verifyToken,
  uploadCoverPhoto.single('cover'),
  userController.uploadCover,
);
userRouter.get(
  '/user/:id',
  authMiddleware.verifyToken,
  userController.getUserInfo,
);

export default userRouter;
