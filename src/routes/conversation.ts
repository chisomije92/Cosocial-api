import express from "express"
import isAuth from '../middlewares/is-auth.js';
import { chatWithUser, getChat, getChatUsers, } from "./../controllers/conversations.js";


const router = express.Router()


router.post('/', isAuth, chatWithUser)
router.get('/users', isAuth, getChatUsers)
router.get('/:receiverId', isAuth, getChat)
export default router