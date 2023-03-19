import express from "express"
import isAuth from "../middlewares/is-auth.js";
import { body } from "express-validator";

import { deleteUser, updateUser, getUser, followUser, unFollowUser, changePassword, getNotifications, getFollowers, getFollowing, getNotFollowing, getNonFollowers, getAuthUser, readAllNotifications, unreadAllNotifications, singleNotificationRead } from './../controllers/users.js';


const router = express.Router()

router.get("/", isAuth, getAuthUser)
router.get("/notifications", isAuth, getNotifications)
router.put("/notifications/read", isAuth, readAllNotifications)

router.put("/notifications/unread", isAuth, unreadAllNotifications)
router.put("/notifications/read/:id", isAuth, singleNotificationRead)
router.put("/update-password", isAuth, [
  body("oldPassword").isLength({ min: 6 }),
  body("newPassword").isLength({ min: 6 }),
], changePassword)
router.get("/notfollowing", isAuth, getNotFollowing)
router.get("/nonfollowers", isAuth, getNonFollowers)
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
router.get("/:id/followers", isAuth, getFollowers)
router.get("/:id/following", isAuth, getFollowing)



export default router