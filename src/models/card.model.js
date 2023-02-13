import Joi from 'joi';

const cardModel = Joi.object({
  boardId: Joi.string().required(),
  listId: Joi.string().required(),
  inCharge: Joi.string().default(null),
  title: Joi.string().min(3).max(32).trim().required(),
  description: Joi.string().default(''),
  isCompleted: Joi.boolean().default(false),
  cover: Joi.string().default(null),
  createdAt: Joi.date().timestamp().default(Date.now()),
  endedAt: Joi.date().timestamp().default(null),
  updatedAt: Joi.date().timestamp().default(null),
  _destroy: Joi.boolean().default(false),
});

export default cardModel;
