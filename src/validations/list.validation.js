import Joi from 'joi';
import httpStatusCode from '../utils/constants.util.js';

const createList = async (req, res, next) => {
  const condition = Joi.object({
    boardId: Joi.string().required(),
    title: Joi.string().min(3).max(32).required(),
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

const updateList = async (req, res, next) => {
  const condition = Joi.object({
    title: Joi.string().min(3).max(32),
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

const listValidation = { createList, updateList };

export default listValidation;
