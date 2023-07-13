var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Message from "../models/message.js";
export const createMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newMessage = new Message(req.body);
        const savedMessage = yield newMessage.save();
        res.status(200).json(savedMessage);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const getMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = yield Message.find({
            conversationId: req.params.conversationId
        });
        res.status(200).json(message);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
//# sourceMappingURL=messages.js.map