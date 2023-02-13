import httpStatusCode from '../utils/constants.util.js';
import userService from '../services/user.service.js';

const signUp = async (req, res) => {
  try {
    const newUser = await userService.signUp(req.body);
    res
      .status(httpStatusCode.CREATED)
      .json({ message: 'Successfully create new account.', newUser });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const signIn = async (req, res) => {
  try {
    const { user, matchPassword, token } = await userService.signIn(req.body);

    if (!user)
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ message: 'User not found!' });

    if (!matchPassword)
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ message: 'Wrong password!' });

    delete user.password;

    res
      .status(httpStatusCode.OK)
      .json({ message: 'Successfully sign in.', user: { ...user, token } });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.userId, req.body);

    res.status(httpStatusCode.OK).json({
      message: 'Successfully updated user info.',
      updatedUser,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const avatar = req.file.path;
    res.status(httpStatusCode.OK).json({
      message: 'Successfully upload avatar.',
      avatar,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const uploadCover = async (req, res) => {
  try {
    const cover = req.file.path;
    res.status(httpStatusCode.OK).json({
      message: 'Successfully upload cover.',
      cover,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const updatedUser = await userService.changePassword(req.userId, req.body);
    if (updatedUser) {
      return res.status(httpStatusCode.OK).json({
        message: 'Successfully change password.',
        updatedUser,
      });
    }
    return res.status(httpStatusCode.BAD_REQUEST).json({
      message: 'Wrong password.',
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserInfo(id);

    res.status(httpStatusCode.OK).json({
      message: 'Successfully get user info.',
      user,
    });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const userController = {
  signUp,
  signIn,
  updateUser,
  uploadAvatar,
  uploadCover,
  changePassword,
  getUserInfo,
};

export default userController;
