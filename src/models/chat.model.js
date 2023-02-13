import Joi from 'joi';

const chatModel = Joi.object({
  title: Joi.string().required().trim(),
  members: Joi.array().items(Joi.string().required()).required(),
  messages: Joi.array().items(Joi.string()).default([]),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(null),
  _destroy: Joi.boolean().default(false),
});

export default chatModel;
