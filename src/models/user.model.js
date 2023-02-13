import Joi from 'joi';

const userModel = Joi.object({
  username: Joi.string().alphanum().min(3).max(32).required(),
  email: Joi.string()
    .trim()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,32}$')).required(),
  repeatPassword: Joi.ref('password'),
  fullName: Joi.string().min(3).max(32).required(),
  avatar: Joi.string().default(null),
  cover: Joi.string().default(null),
  isActive: Joi.boolean().default(false),
  isAdmin: Joi.boolean().default(false),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(null),
});

export default userModel;
