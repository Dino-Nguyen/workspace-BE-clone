import express from 'express';
import userValidation from '../validations/user.validation.js';
import adminController from '../controllers/admin.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const adminRouter = express.Router();

adminRouter.post('/sign-up', userValidation.signUp, adminController.signUp);
adminRouter.post('/sign-in', userValidation.signIn, adminController.signIn);

adminRouter.get('/', 
authMiddleware.verifyToken,
adminController.totalTask,
adminController.totalUser,
adminController.finishedTask,
adminController.todayNewTask,
)


export default adminRouter;
