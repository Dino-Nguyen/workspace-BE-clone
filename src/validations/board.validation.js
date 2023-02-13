import Joi from 'joi';
import httpStatusCode from '../utils/constants.util.js';

const createBoard = async (req, res, next) => {
  req.body.owner = req.userId.toString();
  const condition = Joi.object({
    title: Joi.string().min(3).max(32).required(),
    owner: Joi.string().required(),
    background: Joi.string(),
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

const updateBoard = async (req, res, next) => {
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

const boardValidation = { createBoard, updateBoard };

export default boardValidation;
