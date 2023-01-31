import express from "express"
import isAuth from "../middlewares/is-auth";

import { deleteUser, updateUser, getUser, followUser, unFollowUser } from './../controllers/users';


const router = express.Router()

router.put('/:id', isAuth, updateUser)
router.delete('/:id', isAuth, deleteUser)
router.get("/:id", isAuth, getUser)
router.put("/:id/follow", isAuth, followUser)
router.put("/:id/unfollow", isAuth, unFollowUser)


export default router