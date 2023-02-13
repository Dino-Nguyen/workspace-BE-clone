import Joi from 'joi';

const listModel = Joi.object({
  boardId: Joi.string().required(),
  title: Joi.string().min(3).max(32).trim().required(),
  cardsOrder: Joi.array().items(Joi.string()).default([]),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(null),
  _destroy: Joi.boolean().default(false),
});

export default listModel;
