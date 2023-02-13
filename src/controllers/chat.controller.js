import httpStatusCode from '../utils/constants.util.js';
import chatService from '../services/chat.service.js';

const createChat = async (req, res) => {
  try {
    const newChat = await chatService.createChat(req.body);
    res.status(httpStatusCode.CREATED).json({
      message: 'Successfully created new chat.',
      newChat,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getAllChats = async (req, res) => {
  try {
    const chats = await chatService.getAllChats(req.userId);

    if (chats.length === 0) {
      res
        .status(httpStatusCode.OK)
        .json({ message: 'Wanna find someone to chat with?' });
    } else {
      res
        .status(httpStatusCode.OK)
        .json({ message: 'Successfully get chats.', chats });
    }
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const chatController = { createChat, getAllChats };

export default chatController;
