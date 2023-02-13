import httpStatusCode from '../utils/constants.util.js';
import adminService from '../services/admin.service.js';

const signUp = async (req, res) => {
  try {
    const newAdmin = await adminService.signUp(req.body);
    res
      .status(httpStatusCode.CREATED)
      .json({ message: 'Successfully create new admin.', newAdmin });
  } catch (error) {
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const signIn = async (req, res) => {
  try {
    const { user, matchPassword, token } = await adminService.signIn(req.body);
    console.log(user);

    if (!user)
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ message: 'Admin not found!' });

    if (!matchPassword)
      return res
        .status(httpStatusCode.BAD_REQUEST)
        .json({ message: 'Wrong password!' });

    if (!user.isAdmin)
      return res
        .status(httpStatusCode.UNAUTHORIZED)
        .json({ message: 'Unauthorized.' });

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

const totalTask = async (req, res) => {
  const totalTask = await adminService.totalTask(req.body)
    res
    .status(httpStatusCode.OK)
    .json( {message: 'totalTask', totalTask})
}

const totalUser = async (req, res) => {
  const totalUser = await adminService.totalUser(req.body)
    res
    .status(httpStatusCode.OK)
    .json( {message: 'totalUser', totalUser})
}

const finishedTask = async (req, res) => {
  const finishedTask = await adminService.finishedTask(req.body)
    res
    .status(httpStatusCode.OK)
    .json( {message: 'finishedTask', finishedTask})
}

const todayNewTask = async (req, res) => {
  const todayNewTask = await adminService.todayNewTask(req.body)
    res
    .status(httpStatusCode.OK)
    .json( {message: 'todayNewTask', todayNewTask})
}

const adminController = {
  signIn,
  signUp,
  totalTask,
  totalUser,
  finishedTask,
  todayNewTask
};

export default adminController;
