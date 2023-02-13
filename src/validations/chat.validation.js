import Joi from 'joi';
import httpStatusCode from '../utils/constants.util.js';

const createChat = async (req, res, next) => {
  const { members } = req.body;
  members.unshift(req.userId.toString());

  const condition = Joi.object({
    title: Joi.string().required().trim(),
    members: Joi.array().items(Joi.string().required()).required(),
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

const chatValidation = { createChat };

export default chatValidation;
