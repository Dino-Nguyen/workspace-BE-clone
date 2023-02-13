import { db } from '../configs/db.config.js';
import { ObjectId } from 'mongodb';
import cardModel from '../models/card.model.js';
import validateSchema from '../utils/validate-schema.util.js';
import listService from './list.service.js';
import { toTimeStamp, getWeek } from '../utils/convert-date.util.js';

const createCard = async (data) => {
  try {
    const validatedData = await validateSchema(cardModel, data);
    validatedData.boardId = new ObjectId(validatedData.boardId);
    validatedData.listId = new ObjectId(validatedData.listId);
    const result = await db.cards.insertOne(validatedData);
    if (result.acknowledged) {
      const newCard = await db.cards.findOne({
        _id: result.insertedId,
      });
      const { listId } = newCard;
      const updatedList = await listService.unshiftCardsOrder(
        listId,
        newCard._id,
      );

      return { newCard, updatedList };
    }
  } catch (error) {
    throw new Error(error);
  }
};

const updateCard = async (id, data) => {
  try {
    const updateData = { ...data, updatedAt: Date.now() };
    if (updateData.listId) {
      updateData.listId = new ObjectId(updateData.listId);
    }
    if (updateData.inCharge) {
      updateData.inCharge = new ObjectId(updateData.inCharge);
    }
    if (updateData.endedAt) {
      updateData.endedAt = toTimeStamp(updateData.endedAt);
    }
    const result = await db.cards.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' },
    );

    if (result.value) {
      const { _id } = result.value;
      const cardResult = await db.cards
        .aggregate([
          { $match: { _id: new ObjectId(_id) } },
          {
            $lookup: {
              from: 'users',
              localField: 'inCharge',
              foreignField: '_id',
              pipeline: [{ $project: { avatar: 1, username: 1 } }],
              as: 'inCharge',
            },
          },
        ])
        .toArray();
      const updatedCard = cardResult[0];
      updatedCard.inCharge = updatedCard.inCharge[0];
      return updatedCard;
    } else {
      throw new Error('No document found.');
    }
  } catch (error) {
    throw new Error(error);
  }
};

const deleteCard = async (id) => {
  try {
    const data = { updatedAt: Date.now(), _destroy: true };
    const result = await db.cards.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
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

const deleteCardByBoardId = async (boardId) => {
  try {
    const data = { updatedAt: Date.now(), _destroy: true };
    await db.cards.updateMany(
      { boardId: new ObjectId(boardId), _destroy: false },
      { $set: data },
    );
  } catch (error) {
    throw new Error(error);
  }
};

const deleteCardByListId = async (listId) => {
  try {
    const data = { updatedAt: Date.now(), _destroy: true };
    await db.cards.updateMany(
      { listId: new ObjectId(listId), _destroy: false },
      { $set: data },
    );
  } catch (error) {
    throw new Error(error);
  }
};

const moveCardsToOtherList = async (data) => {
  try {
    const {
      cardId,
      listFromId,
      listFromCardsOrder,
      listToId,
      listToCardsOrder,
    } = data;
    const updateCardData = {
      updatedAt: Date.now(),
      listId: new ObjectId(listToId),
    };
    const updatedCard = await db.cards.findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: updateCardData },
      { returnDocument: 'after' },
    );
    const listFromData = {
      updatedAt: Date.now(),
      cardsOrder: listFromCardsOrder,
    };
    listFromData.cardsOrder.forEach(
      (cardId, index) =>
        (listFromData.cardsOrder[index] = new ObjectId(cardId)),
    );
    const listFrom = await db.lists.findOneAndUpdate(
      { _id: new ObjectId(listFromId) },
      { $set: listFromData },
      { returnDocument: 'after' },
    );
    const listToData = {
      updatedAt: Date.now(),
      cardsOrder: listToCardsOrder,
    };
    listToData.cardsOrder.forEach(
      (cardId, index) => (listToData.cardsOrder[index] = new ObjectId(cardId)),
    );
    const listTo = await db.lists.findOneAndUpdate(
      { _id: new ObjectId(listToId) },
      { $set: listToData },
      { returnDocument: 'after' },
    );
    if (updatedCard.value && listFrom.value && listTo.value) {
      return {
        updatedCard: updatedCard.value,
        listFrom: listFrom.value,
        listTo: listTo.value,
      };
    } else {
      throw new Error('Something went wrong. Please try again!');
    }
  } catch (error) {
    throw new Error(error);
  }
};

const getMonthlyDoneCards = async (userId) => {
  const currentYear = new Date().getFullYear();
  try {
    const allDoneCardsCurrentYear = await db.cards
      .aggregate([
        { $match: { inCharge: userId, _destroy: false, isCompleted: true } },
        { $addFields: { endYear: { $year: { $toDate: '$endedAt' } } } },
        { $addFields: { endMonth: { $month: { $toDate: '$endedAt' } } } },
        { $match: { endYear: currentYear } },
        { $sort: { endedAt: 1 } },
      ])
      .toArray();
    const allCardsCurrentYear = await db.cards
      .aggregate([
        { $match: { inCharge: userId, _destroy: false } },
        { $addFields: { endYear: { $year: { $toDate: '$endedAt' } } } },
        { $addFields: { endMonth: { $month: { $toDate: '$endedAt' } } } },
        { $match: { endYear: currentYear } },
        { $sort: { endedAt: 1 } },
      ])
      .toArray();
    const monthlyCards = {
      1: { allTasks: 0, doneTasks: 0 },
      2: { allTasks: 0, doneTasks: 0 },
      3: { allTasks: 0, doneTasks: 0 },
      4: { allTasks: 0, doneTasks: 0 },
      5: { allTasks: 0, doneTasks: 0 },
      6: { allTasks: 0, doneTasks: 0 },
      7: { allTasks: 0, doneTasks: 0 },
      8: { allTasks: 0, doneTasks: 0 },
      9: { allTasks: 0, doneTasks: 0 },
      10: { allTasks: 0, doneTasks: 0 },
      11: { allTasks: 0, doneTasks: 0 },
      12: { allTasks: 0, doneTasks: 0 },
    };
    allDoneCardsCurrentYear.forEach((card) => {
      monthlyCards[card.endMonth]['doneTasks'] =
        monthlyCards[card.endMonth]['doneTasks'] + 1;
    });
    allCardsCurrentYear.forEach((card) => {
      monthlyCards[card.endMonth]['allTasks'] =
        monthlyCards[card.endMonth]['allTasks'] + 1;
    });
    return monthlyCards;
  } catch (error) {
    throw new Error(error);
  }
};

const getWeeklyDoneCards = async (userId) => {
  try {
    const currentWeek = getWeek(new Date());
    let lastWeek = 0;
    if (currentWeek === 1) {
      lastWeek = 1;
    } else {
      lastWeek = currentWeek - 1;
    }
    const currentWeekDoneCards = await db.cards
      .aggregate([
        { $match: { inCharge: userId, _destroy: false, isCompleted: true } },
        { $addFields: { endWeek: { $week: { $toDate: '$endedAt' } } } },
        { $match: { endWeek: currentWeek } },
        { $sort: { endedAt: 1 } },
      ])
      .toArray();
    const lastWeekDoneCards = await db.cards
      .aggregate([
        { $match: { inCharge: userId, _destroy: false, isCompleted: true } },
        { $addFields: { endWeek: { $week: { $toDate: '$endedAt' } } } },
        { $match: { endWeek: lastWeek } },
        { $sort: { endedAt: 1 } },
      ])
      .toArray();
    const numberOfCurrentWeekDoneCards = currentWeekDoneCards.length;
    const numberOfLastWeekDoneCards = lastWeekDoneCards.length;
    return {
      currentWeekDoneCards: numberOfCurrentWeekDoneCards,
      lastWeekDoneCards: numberOfLastWeekDoneCards,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const getWeeklyNewCards = async (userId) => {
  try {
    const currentWeek = getWeek(new Date());
    let lastWeek = 0;
    if (currentWeek === 1) {
      lastWeek = 1;
    } else {
      lastWeek = currentWeek - 1;
    }
    const currentWeekNewCards = await db.cards
      .aggregate([
        { $match: { inCharge: userId, _destroy: false } },
        { $addFields: { createdWeek: { $week: { $toDate: '$createdAt' } } } },
        { $match: { createdWeek: currentWeek } },
        { $sort: { createdAt: 1 } },
      ])
      .toArray();
    const lastWeekNewCards = await db.cards
      .aggregate([
        { $match: { inCharge: userId, _destroy: false } },
        { $addFields: { createdWeek: { $week: { $toDate: '$createdAt' } } } },
        { $match: { createdWeek: lastWeek } },
        { $sort: { createdAt: 1 } },
      ])
      .toArray();
    const numberOfCurrentWeekNewCards = currentWeekNewCards.length;
    const numberOfLastWeekNewCards = lastWeekNewCards.length;
    return {
      currentWeekNewCards: numberOfCurrentWeekNewCards,
      lastWeekNewCards: numberOfLastWeekNewCards,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const searchCards = async (data, userId) => {
  const trimData = data.trim();
  const query = new RegExp(trimData, 'i');
  try {
    const result = await db.cards
      .aggregate([
        { $match: { title: { $regex: query }, _destroy: false } },
        {
          $lookup: {
            from: 'boards',
            localField: 'boardId',
            foreignField: '_id',
            as: 'board',
          },
        },
        {
          $match: {
            $or: [
              { 'board.owner': userId },
              { 'board.members': { $in: [userId] } },
            ],
          },
        },
        { $project: { board: 0 } },
      ])
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const cardService = {
  createCard,
  updateCard,
  deleteCard,
  deleteCardByBoardId,
  deleteCardByListId,
  moveCardsToOtherList,
  getMonthlyDoneCards,
  getWeeklyDoneCards,
  getWeeklyNewCards,
  searchCards,
};

export default cardService;
