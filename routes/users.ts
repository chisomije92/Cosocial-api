import { deleteUser, updateUser, getUser, followUser, unFollowUser } from './../controllers/users';
import express from "express"


const router = express.Router()

router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.get("/:id", getUser)
router.put("/:id/follow", followUser)
router.put("/:id/unfollow", unFollowUser)


export default router