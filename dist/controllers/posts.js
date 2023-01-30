"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPosts = void 0;
const posts_1 = __importDefault(require("../models/posts"));
const createPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newPost = yield new posts_1.default(req.body);
    try {
        const savedPost = yield newPost.save();
        res.status(200).json(savedPost);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.createPosts = createPosts;
const updatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield posts_1.default.findById(req.params.id);
        if ((post === null || post === void 0 ? void 0 : post.userId) === req.body.userId) {
            yield (post === null || post === void 0 ? void 0 : post.updateOne({
                $set: req.body
            }));
            res.status(200).json("Post created successfully");
        }
        else {
            res.status(403).json("You can only update posts made by you");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.updatePost = updatePost;
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield posts_1.default.findById(req.params.id);
        if ((post === null || post === void 0 ? void 0 : post.userId) === req.body.userId) {
            yield (post === null || post === void 0 ? void 0 : post.deleteOne());
            res.status(200).json("Post deleted successfully");
        }
        else {
            res.status(403).json("You can only delete posts made by you");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.deletePost = deletePost;
//# sourceMappingURL=posts.js.map