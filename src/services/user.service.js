import userModel from '../models/user.model.js';
import { ObjectId } from 'mongodb';
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

    const result = await db.users.insertOne(validatedData);
    if (result.acknowledged) {
      const newUser = await db.users.findOne({
        _id: result.insertedId,
      });
      return newUser;
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
          boardList: 0,
          friends: 0,
          isAdmin: 0,
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

const updateUser = async (userId, data) => {
  const updateData = { ...data, updatedAt: Date.now() };
  try {
    const result = await db.users.findOneAndUpdate(
      { _id: userId },
      { $set: updateData },
      { returnDocument: 'after' },
    );

    if (result.value) {
      return result.value;
    } else {
      throw new Error('No document match.');
    }
  } catch (error) {
    throw new Error(error);
  }
};

const changePassword = async (userId, data) => {
  try {
    const { currentPassword, newPassword } = data;
    const currentUser = await db.users.findOne({ _id: userId });
    const isPasswordMatch = await comparePassword(
      currentPassword,
      currentUser.password,
    );
    if (isPasswordMatch) {
      const hashedNewPassword = await hashPassword(newPassword);
      const result = await db.users.findOneAndUpdate(
        { _id: userId },
        { $set: { password: hashedNewPassword } },
        { returnDocument: 'after' },
      );
      const updatedUser = result.value;
      delete updatedUser.password;
      return updatedUser;
    }
    return null;
  } catch (error) {
    throw new Error(error);
  }
};

const getUserInfo = async (userId) => {
  try {
    const user = await db.users.findOne({ _id: new ObjectId(userId) });
    delete user.password;
    delete user.createdAt;
    delete user.updatedAt;
    return user;
  } catch (error) {
    throw new Error(error);
  }
};

const userService = {
  signUp,
  signIn,
  updateUser,
  changePassword,
  getUserInfo,
};

export default userService;
