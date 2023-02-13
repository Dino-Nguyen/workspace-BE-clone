import { ObjectId } from 'mongodb';
import boardModel from '../models/board.model.js';
import { db } from '../configs/db.config.js';
import validateSchema from '../utils/validate-schema.util.js';
import listService from './list.service.js';
import cardService from './card.service.js';

const createBoard = async (data) => {
  try {
    const validatedData = await validateSchema(boardModel, data);
    validatedData.owner = new ObjectId(validatedData.owner);
    if (validatedData.members) {
      validatedData.members.forEach(
        (member, i) => (validatedData.members[i] = new ObjectId(member)),
      );
    }
    const result = await db.boards.insertOne(validatedData);
    if (result.acknowledged) {
      const newBoard = await db.boards.findOne({
        _id: result.insertedId,
      });
      newBoard.lists = [];
      return newBoard;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const pushListsOrder = async (boardId, listId) => {
  try {
    const result = await db.boards.findOneAndUpdate(
      { _id: boardId },
      { $push: { listsOrder: listId }, $set: { updatedAt: Date.now() } },
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

const deleteListFromListOrder = async (boardId, listId) => {
  try {
    const result = await db.boards.findOneAndUpdate(
      { _id: boardId },
      {
        $pull: { listsOrder: listId },
        $set: { updatedAt: Date.now() },
      },
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

const getBoardDetail = async (boardId) => {
  try {
    const result = await db.boards
      .aggregate([
        { $match: { _id: new ObjectId(boardId) } },
        {
          $lookup: {
            from: 'lists',
            localField: '_id',
            foreignField: 'boardId',
            pipeline: [{ $match: { _destroy: false } }],
            as: 'lists',
          },
        },
        {
          $lookup: {
            from: 'cards',
            localField: '_id',
            foreignField: 'boardId',
            pipeline: [{ $match: { _destroy: false } }],
            as: 'cards',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            pipeline: [{ $project: { avatar: 1, username: 1 } }],
            as: 'owner',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            pipeline: [{ $project: { avatar: 1, username: 1 } }],
            as: 'members',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'cards.inCharge',
            foreignField: '_id',
            pipeline: [{ $project: { avatar: 1, username: 1 } }],
            as: 'inCharge',
          },
        },
      ])
      .toArray();
    const board = result[0];
    board.cards.forEach((card) => {
      if (card.inCharge !== null) {
        card.inCharge = board.inCharge.filter(
          (user) => user._id.toString() === card.inCharge.toString(),
        )[0];
      }
    });
    board.lists.forEach((list) => {
      list.cards = board.cards.filter(
        (card) => card.listId.toString() === list._id.toString(),
      );
    });
    delete board.cards;
    delete board.inCharge;
    return board;
  } catch (error) {
    throw new Error(error);
  }
};

const updateBoard = async (boardId, data) => {
  try {
    const updateData = { ...data, updatedAt: Date.now() };
    const { listsOrder } = updateData;
    if (listsOrder) {
      listsOrder.forEach((listId, index) => {
        listsOrder[index] = new ObjectId(listId);
      });
    }
    const result = await db.boards.findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
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

const deleteBoard = async (id) => {
  try {
    const data = { updatedAt: Date.now(), _destroy: true };
    const result = await db.boards.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' },
    );
    if (result.value) {
      await listService.deleteListsByBoardId(id);
      await cardService.deleteCardByBoardId(id);
      return result.value;
    } else {
      throw new Error('No document found.');
    }
  } catch (error) {
    throw new Error(error);
  }
};

const getYourBoards = async (id) => {
  try {
    return await db.boards.find({ owner: id, _destroy: false }).toArray();
  } catch (error) {
    throw new Error(error);
  }
};

const getInvitedBoards = async (id) => {
  try {
    return await db.boards
      .find({ members: { $in: [id] }, _destroy: false })
      .toArray();
  } catch (error) {
    throw new Error(error);
  }
};

const getBoardProgress = async (id) => {
  try {
    const boards = await db.boards
      .find({
        $or: [
          { owner: id, _destroy: false },
          { members: { $in: [id] }, _destroy: false },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(2)
      .toArray();
    if (boards.length === 2) {
      const firstBoard = boards[0];
      const secondBoard = boards[1];
      const firstBoardCards = await db.cards
        .find({
          boardId: firstBoard._id,
        })
        .toArray();
      const secondBoardCards = await db.cards
        .find({
          boardId: secondBoard._id,
        })
        .toArray();
      boards[0].cards = firstBoardCards;
      boards[1].cards = secondBoardCards;
    } else if (boards.length === 1) {
      const board = await db.cards
        .find({
          boardId: boards[0]._id,
        })
        .toArray();
      boards[0].cards = board;
    }
    return boards;
  } catch (error) {
    throw new Error(error);
  }
};

const getCompletedBoards = async (id) => {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  try {
    const allDoneBoardsCurrentYear = await db.boards
      .aggregate([
        {
          $match: {
            $or: [
              { owner: id, _destroy: false, isCompleted: true },
              { members: { $in: [id] }, _destroy: false, isCompleted: true },
            ],
          },
        },
        { $addFields: { year: { $year: { $toDate: '$updatedAt' } } } },
        { $match: { year: currentYear } },
        { $sort: { updatedAt: 1 } },
      ])
      .toArray();
    const allDoneBoardsLastYear = await db.boards
      .aggregate([
        {
          $match: {
            $or: [
              { owner: id, _destroy: false, isCompleted: true },
              { members: { $in: [id] }, _destroy: false, isCompleted: true },
            ],
          },
        },
        { $addFields: { year: { $year: { $toDate: '$updatedAt' } } } },
        { $match: { year: lastYear } },
        { $sort: { updatedAt: 1 } },
      ])
      .toArray();
    const numberOfCurrentYearDoneBoards = allDoneBoardsCurrentYear.length;
    const numberOfLastYearDoneBoards = allDoneBoardsLastYear.length;
    return {
      currentYearDoneBoards: numberOfCurrentYearDoneBoards,
      lastYearDoneBoards: numberOfLastYearDoneBoards,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const searchBoard = async (data, userId) => {
  const trimData = data.trim();
  const query = new RegExp(trimData, 'i');
  try {
    const result = await db.boards
      .aggregate([
        { $match: { title: { $regex: query }, _destroy: false } },
        {
          $match: {
            $or: [{ members: { $in: [userId] } }, { owner: userId }],
          },
        },
      ])
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const addMember = async (userId, boardId, email) => {
  try {
    const result = {};
    const { members, owner } = await db.boards.findOne({
      _id: new ObjectId(boardId),
    });
    if (owner.toString() !== userId.toString()) {
      result.message = 'Unauthorized.';
      return result;
    }
    const addedMember = await db.users.findOne({ email });
    if (!addedMember) {
      result.message = 'User not found.';
      return result;
    } else {
      members.forEach((member, index) => {
        members[index] = member.toString();
      });
      if (
        members.includes(addedMember._id.toString()) ||
        owner.toString() === addedMember._id.toString()
      ) {
        result.message = 'This user is already in board.';
        return result;
      }
      result.message = 'Successfully update board member.';
      await db.boards.findOneAndUpdate(
        { _id: new ObjectId(boardId) },
        {
          $push: { members: addedMember._id },
          $set: { updatedAt: Date.now() },
        },
        { returnDocument: 'after' },
      );
      const updatedBoard = await db.boards
        .aggregate([
          { $match: { _id: new ObjectId(boardId) } },
          {
            $lookup: {
              from: 'users',
              localField: 'members',
              foreignField: '_id',
              pipeline: [{ $project: { avatar: 1, username: 1 } }],
              as: 'members',
            },
          },
        ])
        .toArray();
      result.updatedBoard = updatedBoard[0];
      return result;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const removeMember = async (userId, boardId, memberId) => {
  try {
    const result = {};
    const { owner } = await db.boards.findOne({
      _id: new ObjectId(boardId),
    });
    if (owner.toString() !== userId.toString()) {
      result.message = 'Unauthorized.';
      return result;
    }
    const updatedBoard = await db.boards.findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      {
        $pull: { members: new ObjectId(memberId) },
        $set: { updatedAt: Date.now() },
      },
      { returnDocument: 'after' },
    );
    result.message = 'Successfully remove member.';
    result.updatedBoard = updatedBoard.value;
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const leaveBoard = async (userId, boardId) => {
  try {
    const result = await db.boards.findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      {
        $pull: { members: new ObjectId(userId) },
        $set: { updatedAt: Date.now() },
      },
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

const boardService = {
  createBoard,
  pushListsOrder,
  deleteListFromListOrder,
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

export default boardService;
