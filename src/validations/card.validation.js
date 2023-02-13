import Joi from 'joi';
import httpStatusCode from '../utils/constants.util.js';

const createCard = async (req, res, next) => {
  const condition = Joi.object({
    title: Joi.string().min(3).max(32).required(),
    boardId: Joi.string().required(),
    listId: Joi.string().required(),
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

const updateCard = async (req, res, next) => {
  const condition = Joi.object({
    title: Joi.string().min(3).max(32).trim(),
    isCompleted: Joi.boolean(),
    dueBy: Joi.date(),
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

const searchCards = async (req, res, next) => {
  const condition = Joi.object({
    query: Joi.string().trim(),
  });

  try {
    await condition.validateAsync(req.body, {
      abortEarly: false,
    });
    next();
  } catch (error) {
    res.status(httpStatusCode.BAD_REQUEST).json({
      message: error.message,
    });
  }
};

const cardValidation = { createCard, updateCard, searchCards };

export default cardValidation;
