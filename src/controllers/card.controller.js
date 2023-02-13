import httpStatusCode from '../utils/constants.util.js';
import cardService from '../services/card.service.js';
import { db } from '../configs/db.config.js';

const createCard = async (req, res) => {
  try {
    const { newCard, updatedList } = await cardService.createCard(req.body);

    res.status(httpStatusCode.CREATED).json({
      message: 'Successfully created new card.',
      newCard,
      updatedList,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCard = await cardService.updateCard(id, req.body);

    res.status(httpStatusCode.OK).json({
      message: 'Successfully updated card.',
      updatedCard,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCard = await cardService.deleteCard(id);

    res.status(httpStatusCode.OK).json({
      message: 'Successfully deleted card.',
      deletedCard,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const moveCardsToOtherList = async (req, res) => {
  try {
    const { updatedCard, listFrom, listTo } =
      await cardService.moveCardsToOtherList(req.body);
    res.status(httpStatusCode.OK).json({
      message: 'Successfully move card.',
      updatedCard,
      listFrom,
      listTo,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const searchCards = async (req, res) => {
  const { query } = req.body;
  const userId = req.userId;
  try {
    const searchedCards = await cardService.searchCards(query, userId);
    if (searchedCards.length === 0) {
      res.status(httpStatusCode.OK).json({ message: 'No cards found.' });
    } else {
      res
        .status(httpStatusCode.OK)
        .json({ message: 'Successfully search cards.', searchedCards });
    }
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getMonthlyDoneCards = async (req, res) => {
  try {
    const monthlyCards = await cardService.getMonthlyDoneCards(req.userId);

    res.status(httpStatusCode.OK).json({
      message: 'Successfully get all monthly cards.',
      monthlyCards,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const uploadImage = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCard = await cardService.updateCard(id, {
      cover: req.file.path,
    });
    res.status(httpStatusCode.OK).json({
      message: 'Successfully upload image.',
      updatedCard,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getWeeklyDoneCards = async (req, res) => {
  try {
    const weeklyDoneCards = await cardService.getWeeklyDoneCards(req.userId);
    res.status(httpStatusCode.OK).json({
      message: 'Successfully get last week done cards.',
      weeklyDoneCards,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getWeeklyNewCards = async (req, res) => {
  try {
    const weeklyNewCards = await cardService.getWeeklyNewCards(req.userId);
    res.status(httpStatusCode.OK).json({
      message: 'Successfully get last week done cards.',
      weeklyNewCards,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const cardController = {
  createCard,
  updateCard,
  deleteCard,
  moveCardsToOtherList,
  searchCards,
  getMonthlyDoneCards,
  uploadImage,
  getWeeklyDoneCards,
  getWeeklyNewCards,
};

export default cardController;
