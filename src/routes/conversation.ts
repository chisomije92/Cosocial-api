import express from "express"
import isAuth from '../middlewares/is-auth.js';
import { chatWithUser, createConversation, getChatUsers, getConversation } from "./../controllers/conversations.js";


const router = express.Router()


//router.post('/', isAuth, createConversation)
router.post('/', chatWithUser)
router.get('/:userId', getChatUsers)
//router.get('/:userId', isAuth, getConversation)
export default router