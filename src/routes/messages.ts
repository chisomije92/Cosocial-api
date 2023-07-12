import express from "express"
import isAuth from '../middlewares/is-auth.js';
import { createMessage } from "./../controllers/messages.js";


const router = express.Router()


router.post('/', isAuth, createMessage)


export default router