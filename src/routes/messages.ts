import express from "express"
import isAuth from '../middlewares/is-auth.js';
import { createMessage, getMessage } from "./../controllers/messages.js";


const router = express.Router()


router.post('/', isAuth, createMessage)

router.get('/:conversationId', isAuth, getMessage)


export default router