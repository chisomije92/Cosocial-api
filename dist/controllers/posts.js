var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { join, resolve } from 'path';
import { CustomError } from './../error-model/custom-error.js';
import Posts from "../models/posts.js";
import Users from "../models/user.js";
import { unlink } from 'fs';
const __dirname = resolve();
export const createPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    const description = req.body.description;
    try {
        const newPost = new Posts({ description, image, userId: req.userId });
        const savedPost = yield newPost.save();
        res.status(200).json(savedPost);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const updatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const updatedDescription = req.body.description;
    const updatedImage = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
    try {
        const post = yield Posts.findById(req.params.id);
        if (!post) {
            throw new CustomError("Post not found", 404);
        }
        if (post.userId === req.userId) {
            post.description = updatedDescription;
            if (updatedImage !== post.image && updatedImage) {
                clearImage(post.image);
                post.image = updatedImage;
            }
            yield post.save();
            res.status(200).json("Post updated successfully");
        }
        else {
            const error = new CustomError("You can only update posts made by you!", 403);
            throw error;
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Posts.findById(req.params.id);
        if (!post) {
            const error = new CustomError("Post not found!", 404);
            throw error;
        }
        if (post.userId === req.userId) {
            clearImage(post.image);
            yield (post === null || post === void 0 ? void 0 : post.deleteOne());
            res.status(200).json("Post deleted successfully");
        }
        else {
            const error = new CustomError("You can only delete posts made by you!", 403);
            throw error;
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const likePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Posts.findById(req.params.id);
        if (!post) {
            const error = new CustomError("Post not found!", 404);
            throw error;
        }
        const targetUser = yield Users.findById(post.userId);
        if (!targetUser) {
            const error = new CustomError("User not found!", 404);
            throw error;
        }
        if (req.userId) {
            const currentUser = yield Users.findById(req.userId);
            if (!post.likes.includes(req.userId)) {
                yield post.updateOne({ $push: { likes: req.userId } });
                yield (targetUser === null || targetUser === void 0 ? void 0 : targetUser.updateOne({
                    $push: {
                        notifications: {
                            actions: `${currentUser === null || currentUser === void 0 ? void 0 : currentUser.username} liked your post`,
                            read: false,
                            dateOfAction: new Date().toISOString()
                        }
                    }
                }));
                res.status(200).json("User liked post!");
            }
            else {
                yield post.updateOne({ $pull: { likes: req.userId } });
                res.status(403).json("Like removed from post");
            }
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const getPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Posts.findById(req.params.id);
        if (!post) {
            const error = new CustomError("Post not found!", 404);
            throw error;
        }
        res.status(200).json(post);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const getPostsOnTL = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = yield Users.findById(req.params.id);
        const userPosts = yield Posts.find({ userId: currentUser === null || currentUser === void 0 ? void 0 : currentUser._id });
        if (!currentUser) {
            const error = new CustomError("User not found!", 404);
            throw error;
        }
        const friendPosts = yield Promise.all(currentUser.following.map(friendId => { return Posts.find({ userId: friendId }); }));
        res.status(200).json(userPosts.concat(...friendPosts));
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const bookmarkPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Posts.findById(req.params.id);
        if (!post) {
            const error = new CustomError("Post not found!", 404);
            throw error;
        }
        const currentUser = yield Users.findById(req.userId);
        if (!currentUser) {
            const error = new CustomError("User not found!", 404);
            throw error;
        }
        if (!currentUser.bookmarks.includes(post.id)) {
            yield currentUser.updateOne({ $push: { bookmarks: post.id } });
            res.status(200).json("Added to bookmarks");
        }
        else {
            yield currentUser.updateOne({ $pull: { bookmarks: post.id } });
            res.status(403).json("Removed from bookmarks");
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const getAllBookmarks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield Users.findById(req.userId).populate("bookmarks");
        if (!user) {
            const error = new CustomError("User not found!", 404);
            throw error;
        }
        res.status(200).json(user["bookmarks"]);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
const clearImage = (imagePath) => {
    imagePath = join(__dirname, imagePath);
    unlink(imagePath, (err) => {
        if (err)
            console.log(err);
    });
};
//# sourceMappingURL=posts.js.map