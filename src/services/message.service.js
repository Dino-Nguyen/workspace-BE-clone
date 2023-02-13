import messageModel from '../models/message.model.js';
import validateSchema from '../utils/validate-schema.util.js';
import chatService from './chat.service.js';
import { db } from '../configs/db.config.js';
import { ObjectId } from 'mongodb';

const createMessage = async (data) => {
  try {
    const validatedData = await validateSchema(messageModel, data);
    validatedData.chatId = new ObjectId(validatedData.chatId);
    const result = await db.messages.insertOne(validatedData);

    if (result.acknowledged) {
      const newMessage = await db.messages.findOne({ _id: result.insertedId });
      const { chatId } = newMessage;
      const updatedChat = await chatService.updateMessages(
        chatId,
        newMessage._id,
      );

      return { newMessage, updatedChat };
    }
  } catch (error) {
    throw new Error(error);
  }
};

const messageService = { createMessage };

export default messageService;
