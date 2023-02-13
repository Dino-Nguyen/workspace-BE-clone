import userModel from '../models/user.model.js';
import { db } from '../configs/db.config.js';
import authMiddleware from '../middleware/auth.middleware.js';
import validateSchema from '../utils/validate-schema.util.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';

const signUp = async (data) => {
  try {
    const validatedData = await validateSchema(userModel, data);
    const { password } = validatedData;
    const hashedPassword = await hashPassword(password);

    delete validatedData.repeatPassword;
    validatedData.password = hashedPassword;
    validatedData.isAdmin = true;

    const result = await db.users.insertOne(validatedData);
    if (result.acknowledged) {
      const newAdmin = await db.users.findOne({
        _id: result.insertedId,
      });
      delete newAdmin.password;
      return newAdmin;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const signIn = async (data) => {
  try {
    const { email, password } = data;
    const result = {};
    result.user = await db.users.findOne(
      { email },
      {
        projection: {
          createdAt: 0,
          updatedAt: 0,
        },
      },
    );
    if (result.user) {
      result.matchPassword = await comparePassword(
        password,
        result.user.password,
      );
      result.token = authMiddleware.generateToken(result.user._id);
    }
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const totalTask = async () => {
  const result = await db.cards.toArray()
  return result.length
}

const totalUser = async() => {
  const result = await db.users.toArray()
  return result.length
}

const finishedTask = async() => {
  const result = await db.cards
  .sort({isCompleted: true})
  .toArray()
  return result
}

const todayNewTask = async() => {
  const day = new Date()
  const today = day.getDate()
  const currentMonth = day.getMonth() +1
  const currentYear = day.getFullYear()
  const result = await db.cards
  .aggregate([
    {year: {$year : {$toDate:'$createdAt'}}},
    {month: {$month : {$toDate:'$createdAt'}}},
    {week: {$week : {$toDate:'$createdAt'}}},
    {day: {$dayOfMonth : {$toDate:'$createdAt'}}},
    {dayOfYear: {$dayOfYear: {$toDate: '$createdAt'}}},
    {dayOfWeek: {$dayOfWeek: {$toDate: '$createdAt'}}},
    {$match:[
      {year : currentYear},
      {month: currentMonth},
      {day: today}
    ] }
  ])
  .toArray()
return result
  
}

const adminService = {
  signIn,
  signUp,
  totalTask,
  totalUser,
  finishedTask,
  todayNewTask
};

export default adminService;
