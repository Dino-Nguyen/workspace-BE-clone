import jwt from 'jsonwebtoken';
import env from '../configs/env.config.js';
import httpStatusCode from '../utils/constants.util.js';
import { db } from '../configs/db.config.js';
import { ObjectId } from 'mongodb';

const generateToken = (id) => {
  const token = jwt.sign({ id }, env.JWT_SECRET_KEY, {
    expiresIn: env.TOKEN_EXPIRE_TIME,
  });

  return token;
};

const verifyToken = async (req, res, next) => {
  try {
    const headers = req.headers['authorization'];

    if (!headers)
      return res
        .status(httpStatusCode.UNAUTHORIZED)
        .json({ message: 'Unauthorized.' });

    const token = headers.split(' ')[1];
    jwt.verify(token, env.JWT_SECRET_KEY, async (error, verifiedToken) => {
      if (error)
        return res
          .status(httpStatusCode.UNAUTHORIZED)
          .json({ message: error.message });
      const userId = new ObjectId(verifiedToken.id);
      const user = await db.users.findOne(
        { _id: userId },
        { projection: { password: 0 } },
      );
      req.userId = user._id;
      next();
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const verifyOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const deletedBoard = await db.boards.findOne({ _id: new ObjectId(id) });
    if (userId.toString() === deletedBoard.owner.toString()) {
      next();
    } else {
      res
        .status(httpStatusCode.UNAUTHORIZED)
        .json({ message: 'Unauthorized.' });
    }
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const verifyMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { members, owner } = await db.boards.findOne({
      _id: new ObjectId(id),
    });
    if (
      !members.includes(userId.toString()) &&
      owner.toString() !== userId.toString()
    ) {
      return res
        .status(httpStatusCode.UNAUTHORIZED)
        .json({ message: 'Unauthorized.' });
    }
    next();
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const authMiddleware = {
  generateToken,
  verifyToken,
  verifyOwner,
  verifyMember,
};

export default authMiddleware;
