import Joi from 'joi';
import httpStatusCode from '../utils/constants.util.js';

const createMessage = async (req, res, next) => {
  req.body.sender = req.userId.toString();
  const condition = Joi.object({
    sender: Joi.string().required(),
    chatId: Joi.string().required(),
    content: Joi.string().required(),
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

const messageValidation = { createMessage };

export default messageValidation;
