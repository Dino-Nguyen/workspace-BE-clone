import Joi from 'joi';

const messageModel = Joi.object({
  sender: Joi.string().required(),
  chatId: Joi.string().required(),
  content: Joi.string().trim().required(),
  readBy: Joi.array().items(Joi.string()).default([]),
  reaction: Joi.any().default(null),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(null),
  _destroy: Joi.boolean().default(false),
});

export default messageModel;
