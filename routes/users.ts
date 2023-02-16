import express from "express"
import isAuth from "../middlewares/is-auth";
import { body } from "express-validator";

import { deleteUser, updateUser, getUser, followUser, unFollowUser } from './../controllers/users';


const router = express.Router()

router.put('/:id', isAuth, [
  body("email").isEmail().normalizeEmail().optional({ nullable: true, checkFalsy: true }),
  body("username").trim().isLength({ min: 4 }).optional({ nullable: true, checkFalsy: true }),
  body("password").isLength({ min: 6 }).optional({ nullable: true, checkFalsy: true }),
], updateUser)
router.delete('/:id', isAuth, deleteUser)
router.get("/:id", isAuth, getUser)
router.put("/:id/follow", isAuth, followUser)
router.put("/:id/unfollow", isAuth, unFollowUser)


export default router