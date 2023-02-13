import httpStatusCode from '../utils/constants.util.js';
import boardService from '../services/board.service.js';

const createBoard = async (req, res) => {
  try {
    const newBoard = await boardService.createBoard(req.body);
    res.status(httpStatusCode.CREATED).json({
      message: 'Successfully created new board.',
      newBoard,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBoard = await boardService.updateBoard(id, req.body);
    res
      .status(httpStatusCode.OK)
      .json({ message: 'Successfully updated board.', updatedBoard });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBoard = await boardService.deleteBoard(id);
    res
      .status(httpStatusCode.OK)
      .json({ message: 'Successfully deleted board.', deletedBoard });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getBoardDetail = async (req, res) => {
  const boardId = req.params;
  try {
    const board = await boardService.getBoardDetail(boardId);
    res.status(httpStatusCode.OK).json({
      message: 'Successfully get board.',
      board,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getYourBoards = async (req, res) => {
  try {
    const yourBoards = await boardService.getYourBoards(req.userId);
    if (yourBoards.length === 0) {
      res
        .status(httpStatusCode.OK)
        .json({ message: "Haven't had your own board? Create new one." });
    } else {
      res
        .status(httpStatusCode.OK)
        .json({ message: 'Successfully get your boards.', yourBoards });
    }
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getInvitedBoards = async (req, res) => {
  try {
    const invitedBoards = await boardService.getInvitedBoards(req.userId);
    if (invitedBoards.length === 0) {
      res.status(httpStatusCode.OK).json({ message: 'No board found.' });
    } else {
      res.status(httpStatusCode.OK).json({
        message: 'Successfully get your invited boards.',
        invitedBoards,
      });
    }
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getBoardProgress = async (req, res) => {
  try {
    const boards = await boardService.getBoardProgress(req.userId);
    if (boards.length === 0) {
      res.status(httpStatusCode.OK).json({ message: 'No board found.' });
    } else {
      res.status(httpStatusCode.OK).json({
        message: 'Successfully get boards progress.',
        boards,
      });
    }
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getCompletedBoards = async (req, res) => {
  try {
    const completedBoards = await boardService.getCompletedBoards(req.userId);
    if (completedBoards.length === 0) {
      res.status(httpStatusCode.OK).json({ message: 'No board found.' });
    } else {
      res.status(httpStatusCode.OK).json({
        message: 'Successfully get boards progress.',
        completedBoards,
      });
    }
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const searchBoard = async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.userId;
    const searchedBoards = await boardService.searchBoard(query, userId);
    if (searchedBoards.length === 0) {
      res.status(httpStatusCode.OK).json({ message: 'No boards found.' });
    } else {
      res
        .status(httpStatusCode.OK)
        .json({ message: 'Successfully search boards.', searchedBoards });
    }
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const userId = req.userId;
    const { boardId, email } = req.body;
    const result = await boardService.addMember(userId, boardId, email);
    if (result.message === 'Unauthorized.') {
      return res
        .status(httpStatusCode.UNAUTHORIZED)
        .json({ message: result.message });
    }
    if (result.message === 'User not found.') {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ message: result.message });
    }
    if (result.message === 'This user is already in board.') {
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ message: result.message });
    }

    res.status(httpStatusCode.OK).json({
      message: result.message,
      updatedBoard: result.updatedBoard,
      members: result.updatedBoard.members,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const userId = req.userId;
    const { boardId, memberId } = req.body;
    const result = await boardService.removeMember(userId, boardId, memberId);
    if (result.message === 'Unauthorized.') {
      return res
        .status(httpStatusCode.UNAUTHORIZED)
        .json({ message: result.message });
    }

    res.status(httpStatusCode.OK).json({
      message: result.message,
      updatedBoard: result.updatedBoard,
      members: result.updatedBoard.members,
    });
    return result;
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const leaveBoard = async (req, res) => {
  try {
    const userId = req.userId;
    const { boardId } = req.body;
    const updatedBoard = await boardService.leaveBoard(userId, boardId);
    res
      .status(httpStatusCode.OK)
      .json({ message: 'Successfully leave board.', updatedBoard });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const boardController = {
  createBoard,
  getBoardDetail,
  updateBoard,
  deleteBoard,
  getYourBoards,
  getInvitedBoards,
  getBoardProgress,
  getCompletedBoards,
  searchBoard,
  addMember,
  removeMember,
  leaveBoard,
};

export default boardController;
