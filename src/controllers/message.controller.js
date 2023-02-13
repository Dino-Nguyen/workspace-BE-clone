import httpStatusCode from '../utils/constants.util.js';
import messageService from '../services/message.service.js';

const createMessage = async (req, res) => {
  try {
    const { newMessage, updatedChat } = await messageService.createMessage(
      req.body,
    );
    res
      .status(httpStatusCode.CREATED)
      .json({
        message: 'Successfully created new message.',
        newMessage,
        updatedChat,
      });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const messageController = { createMessage };

export default messageController;
