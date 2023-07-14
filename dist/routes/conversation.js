import express from "express";
import { chatWithUser, getChatUsers } from "./../controllers/conversations.js";
const router = express.Router();
//router.post('/', isAuth, createConversation)
router.post('/', chatWithUser);
router.get('/:userId', getChatUsers);
//router.get('/:userId', isAuth, getConversation)
export default router;
//# sourceMappingURL=conversation.js.map