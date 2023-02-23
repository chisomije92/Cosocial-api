import express from "express"
import isAuth from "../middlewares/is-auth";
import { body } from "express-validator";

import { deleteUser, updateUser, getUser, followUser, unFollowUser, changePassword } from './../controllers/users';


const router = express.Router()
router.put("/update-password", isAuth, [
  body("oldPassword").isLength({ min: 6 }),
  body("newPassword").isLength({ min: 6 }),
], changePassword)
router.put('/:id', isAuth, [
  body("email")
    .optional()
    .isEmail(),
  body("username").trim().isLength({ min: 4 })
    .optional({ nullable: true, checkFalsy: true })
  ,
  body("password").isLength({ min: 6 })
    .optional({ nullable: true, checkFalsy: true }),
], updateUser)

router.delete('/:id', isAuth, deleteUser)
router.get("/:id", isAuth, getUser)
router.put("/:id/follow", isAuth, followUser)
router.put("/:id/unfollow", isAuth, unFollowUser)


export default router