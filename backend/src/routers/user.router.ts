import express from 'express'
import { UserController } from '../controllers/user.controller'
import { uploadUser } from '../upload'

const userRouter = express.Router()

userRouter.route('/getAll').get(
    (req, res) => new UserController().getAll(req, res)
)

userRouter.route('/login').post(
    (req, res) => new UserController().login(req, res)
)

userRouter.route('/register').post(
    uploadUser.single('profileImage'),
    (req, res) => new UserController().register(req, res)
)

userRouter.route('/changePassword').post(
    (req, res) => new UserController().changePassword(req, res)
)

userRouter.route('/changeStatus').post(
    (req, res) => new UserController().changeStatus(req, res)
)

userRouter.route('/editUser').post(
    uploadUser.single('profileImage'),
    (req, res) => new UserController().editUser(req, res)
)

userRouter.route('/deleteUser').post(
    (req, res) => new UserController().deleteUser(req, res)
)

export default userRouter

