var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Conversation from "../models/conversation.js";
export const createConversation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newConversation = new Conversation({
            members: [req.body.senderId, req.body.receiverId]
        });
        const savedConversation = yield newConversation.save();
        res.status(200).json(savedConversation);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const getConversation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversation = yield Conversation.find({
            members: { $in: [req.params.userId] }
        });
        res.status(200).json(conversation);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
//# sourceMappingURL=conversations.js.map