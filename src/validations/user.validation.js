import Joi from 'joi';
import httpStatusCode from '../utils/constants.util.js';
import { db } from '../configs/db.config.js';

const signUp = async (req, res, next) => {
  const condition = Joi.object({
    username: Joi.string().alphanum().min(3).max(32).required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
      })
      .required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{6,32}$'))
      .required(),
    repeatPassword: Joi.ref('password'),
    fullName: Joi.string().alphanum().min(3).max(32).required(),
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    const { email, username } = req.body;

    const existedUsername = await db.users.findOne(
      { username },
      { projection: { username: 1 } },
    );
    if (existedUsername) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        message: `This username has already been taken.`,
      });
    }

    const existedEmail = await db.users.findOne(
      { email },
      { projection: { email: 1 } },
    );
    if (existedEmail) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        message: `This email has already been taken.`,
      });
    }

    next();
  } catch (error) {
    res.status(httpStatusCode.BAD_REQUEST).json({
      message: error.message,
    });
  }
};

const signIn = async (req, res, next) => {
  const condition = Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
      })
      .required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{6,32}$'))
      .required(),
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(httpStatusCode.BAD_REQUEST).json({
      message: error.message,
    });
  }
};

const updateUser = async (req, res, next) => {
  const condition = Joi.object({
    fullName: Joi.string().min(3).max(32).trim(),
    avatar: Joi.string(),
    dueBy: Joi.date(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,32}$')),
    repeatPassword: Joi.ref('password'),
  });

  try {
    await condition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    next();
  } catch (error) {
    res.status(httpStatusCode.BAD_REQUEST).json({
      message: error.message,
    });
  }
};

const changePassword = async (req, res, next) => {
  const condition = Joi.object({
    newPassword: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,32}$')),
    repeatNewPassword: Joi.ref('newPassword'),
  });

  try {
    await condition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    next();
  } catch (error) {
    res.status(httpStatusCode.BAD_REQUEST).json({
      message: error.message,
    });
  }
};

const userValidation = { signUp, signIn, updateUser, changePassword };

export default userValidation;
