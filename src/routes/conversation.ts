import express from "express"
import isAuth from '../middlewares/is-auth.js';
import { createConversation, getConversation } from "./../controllers/conversations.js";


const router = express.Router()


router.post('/', isAuth, createConversation)

router.get('/:userId', isAuth, getConversation)
export default router