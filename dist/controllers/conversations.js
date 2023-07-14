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
import Users from "../models/user.js";
import { CustomError } from "../error-model/custom-error.js";
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
export const chatWithUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let conversation;
        const foundConversation = yield Conversation.findOne({
            members: {
                $all: [req.body.senderId, req.body.receiverId]
            }
        });
        if (!foundConversation) {
            conversation = new Conversation({
                members: [req.body.senderId, req.body.receiverId],
                messages: [{
                        senderId: req.body.senderId,
                        receiverId: req.body.receiverId,
                        text: req.body.text,
                        dateOfAction: new Date().toISOString()
                    }]
            });
            yield conversation.save();
            console.log("not found");
        }
        else {
            let updatedMessages = foundConversation.messages.concat({
                senderId: req.body.senderId,
                receiverId: req.body.receiverId,
                text: req.body.text,
                dateOfAction: new Date().toISOString()
            });
            yield foundConversation.updateOne({
                messages: updatedMessages
            });
            console.log("found");
        }
        res.status(200).json(conversation);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const getChatUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = yield Users.findById(req.params.userId);
        if (!currentUser) {
            const error = new CustomError("User not found!", 404);
            throw error;
        }
        const foundConversations = yield Conversation.find({
            members: {
                $in: [req.params.userId]
            }
        });
        if (foundConversations) {
            const chatUsersIds = foundConversations.map(v => {
                return v.members
                    .filter((id) => id !== req.params.userId)
                    .reduce((v) => v);
            });
            const chats = foundConversations.map(v => {
                return v.messages.slice(-1).reduce(m => {
                    var _a;
                    return {
                        id: (_a = m._id) === null || _a === void 0 ? void 0 : _a.toString(),
                        text: m.text,
                        senderId: m.senderId,
                        receiverId: m.receiverId,
                        dateOfAction: m.dateOfAction,
                    };
                });
            });
            const chatUsers = yield Promise.all(chatUsersIds.map((id) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                const user = yield Users.findById(id);
                return {
                    _id: user === null || user === void 0 ? void 0 : user._id.toString(),
                    username: user === null || user === void 0 ? void 0 : user.username,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    profilePicture: user === null || user === void 0 ? void 0 : user.profilePicture,
                    recentMessage: (_a = chats.find(c => user.id === c.senderId || user.id === c.receiverId)) === null || _a === void 0 ? void 0 : _a.text,
                    recentDate: (_b = chats.find(c => user.id === c.senderId || user.id === c.receiverId)) === null || _b === void 0 ? void 0 : _b.dateOfAction
                };
            })));
            res.status(200).json(chatUsers);
        }
        else {
            res.status(200).json([]);
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
//# sourceMappingURL=conversations.js.map