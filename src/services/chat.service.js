import { db } from '../configs/db.config.js';
import { ObjectId } from 'mongodb';
import validateSchema from '../utils/validate-schema.util.js';
import chatModel from '../models/chat.model.js';

const createChat = async (data) => {
  try {
    const validatedData = await validateSchema(chatModel, data);
    validatedData.members.forEach(
      (member, i) => (validatedData.members[i] = new ObjectId(member)),
    );
    const result = await db.chats.insertOne(validatedData);

    if (result.acknowledged) {
      return await db.chats.findOne({ _id: result.insertedId });
    }
  } catch (error) {
    throw new Error(error);
  }
};

const updateMessages = async (chatId, messageId) => {
  try {
    const result = await db.chats.findOneAndUpdate(
      { _id: chatId },
      { $push: { messages: messageId }, $set: { updatedAt: Date.now() } },
      { returnDocument: 'after' },
    );
    if (result.value) {
      return result.value;
    } else {
      throw new Error('No document found.');
    }
  } catch (error) {
    throw new Error(error);
  }
};

const getAllChats = async (userId) => {
  try {
    const result = await db.chats
      .aggregate([
        { $match: { members: userId } },
        { $addFields: { latestMessageId: { $last: '$messages' } } },
        {
          $lookup: {
            from: 'messages',
            localField: 'latestMessageId',
            foreignField: '_id',
            as: 'lastMessage',
          },
        },
        {
          $project: {
            latestMessageId: 0,
            'lastMessage._id': 0,
            'lastMessage.chatId': 0,
          },
        },
      ])
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const chatService = { createChat, updateMessages, getAllChats };

export default chatService;
