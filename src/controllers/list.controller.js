import httpStatusCode from '../utils/constants.util.js';
import listService from '../services/list.service.js';

const createList = async (req, res) => {
  try {
    const { newList, updatedBoard } = await listService.createList(req.body);
    res.status(httpStatusCode.CREATED).json({
      message: 'Successfully created new list.',
      newList,
      updatedBoard,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedList = await listService.updateList(id, req.body);
    res.status(httpStatusCode.OK).json({
      message: 'Successfully updated list.',
      updatedList,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedList, updatedBoard } = await listService.deleteList(id);
    res.status(httpStatusCode.OK).json({
      message: 'Successfully deleted list.',
      deletedList,
      updatedBoard,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const listController = { createList, updateList, deleteList };

export default listController;
