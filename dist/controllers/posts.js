var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { resolve } from 'path';
import { CustomError } from './../error-model/custom-error.js';
import Posts from "../models/posts.js";
import Users from "../models/user.js";
import { clearImage } from '../utils/utils.js';
import { Types } from 'mongoose';
import { getIO } from "../socket/index.js";
const __dirname = resolve();
export const createPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    const description = req.body.description;
    let imageUrl = image;
    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    }
    try {
        const newPost = new Posts({ description, image: imageUrl, userId: req.userId, linkedUser: req.userId });
        const savedPost = yield newPost.save();
        const user = yield Users.findById(req.userId);
        if (!user) {
            throw new CustomError("User does not exist", 404);
        }
        getIO().emit("posts", {
            action: "create",
            post: Object.assign(Object.assign({}, savedPost.toObject()), { linkedUser: {
                    username: user.username,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    _id: user._id
                } })
        });
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
    let imageUrl = updatedImage;
    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    }
    try {
        const post = yield Posts.findById(req.params.id);
        if (!post) {
            throw new CustomError("Post does not exist", 404);
        }
        if (post.userId.toString() === req.userId) {
            post.description = updatedDescription;
            if (imageUrl && imageUrl !== post.image && post.image.length > 0) {
                clearImage(post.image, __dirname);
                post.image = imageUrl;
            }
            yield post.save();
            const user = yield Users.findById(req.userId);
            if (!user) {
                throw new CustomError("User does not exist", 404);
            }
            getIO().emit("posts", {
                action: "update",
                post: Object.assign(Object.assign({}, post.toObject()), { linkedUser: {
                        username: user.username,
                        email: user.email,
                        profilePicture: user.profilePicture,
                        _id: user._id
                    } })
            });
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
            const error = new CustomError("Post does not exist!", 404);
            throw error;
        }
        if (post.userId === req.userId) {
            if (post.image) {
                clearImage(post.image, __dirname);
            }
            yield post.deleteOne();
            const user = yield Users.findById(req.userId);
            if (!user) {
                throw new CustomError("User does not exist", 404);
            }
            getIO().emit("posts", {
                action: "delete",
                post: Object.assign({}, post.toObject())
            });
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
export const getUserPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = [
            {
                path: 'linkedUser',
                select: 'username email profilePicture _id'
            },
            {
                path: 'likes',
                select: 'username email profilePicture _id'
            }
        ];
        const currentUser = yield Users.findById(req.params.id);
        if (!currentUser) {
            const error = new CustomError("User not found!", 404);
            throw error;
        }
        const userPosts = yield Posts.find({ userId: currentUser._id }).populate(query);
        res.status(200).json(userPosts);
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
            const error = new CustomError("Post does not exist", 404);
            throw error;
        }
        const targetUser = yield Users.findById(post.userId);
        if (!targetUser) {
            const error = new CustomError("User does not exist", 404);
            throw error;
        }
        if (req.userId) {
            const currentUser = yield Users.findById(req.userId);
            if (!post.likes.includes(new Types.ObjectId(req.userId))) {
                yield post.updateOne({ $push: { likes: new Types.ObjectId(req.userId) } });
                if (targetUser.id !== req.userId) {
                    yield targetUser.updateOne({
                        $push: {
                            notifications: {
                                actions: `${currentUser === null || currentUser === void 0 ? void 0 : currentUser.username} liked your post`,
                                actionUser: {
                                    email: currentUser === null || currentUser === void 0 ? void 0 : currentUser.email,
                                    username: currentUser === null || currentUser === void 0 ? void 0 : currentUser.username,
                                    profilePicture: currentUser === null || currentUser === void 0 ? void 0 : currentUser.profilePicture,
                                    userId: currentUser === null || currentUser === void 0 ? void 0 : currentUser.id
                                },
                                actionPostId: post.id,
                                read: false,
                                dateOfAction: new Date().toISOString()
                            }
                        }
                    });
                }
                res.status(200).json("User liked post!");
            }
            else {
                yield post.updateOne({ $pull: { likes: new Types.ObjectId(req.userId) } });
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
    const query = [
        {
            path: 'linkedUser',
            select: 'username email profilePicture _id'
        },
        {
            path: 'likes',
            select: 'username email profilePicture _id'
        }
    ];
    try {
        const post = yield Posts.findById(req.params.id).populate(query);
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
        if (!currentUser) {
            const error = new CustomError("User not found!", 404);
            throw error;
        }
        const query = [
            {
                path: 'linkedUser',
                select: 'username email profilePicture _id'
            },
            {
                path: 'likes',
                select: 'username email profilePicture _id'
            }
        ];
        const userPosts = yield Posts.find({ userId: currentUser._id }).populate(query);
        const friendPosts = yield Promise.all(currentUser.following.map(friendId => { return Posts.find({ userId: friendId }).populate(query); }));
        res.status(200).json(userPosts.concat(...friendPosts));
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const getPostsOnExplore = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = [
        {
            path: 'linkedUser',
            select: 'username email profilePicture _id'
        },
        {
            path: 'likes',
            select: 'username email profilePicture _id'
        }
    ];
    try {
        const randomPosts = yield Posts.aggregate([{ $sample: { size: 17 } }]);
        const aggregatedPosts = yield Posts.populate(randomPosts, query);
        res.status(200).json(aggregatedPosts);
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
export const createComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Posts.findById(req.params.id);
        if (!post) {
            throw new CustomError("Post not found", 404);
        }
        const currentUser = yield Users.findById(req.userId);
        const postUser = yield Users.findById(post.userId);
        if (!currentUser || !postUser) {
            throw new CustomError("User not found", 404);
        }
        yield (post === null || post === void 0 ? void 0 : post.updateOne({
            $push: {
                comments: {
                    comment: req.body.comment,
                    dateOfReply: new Date().toISOString(),
                    commenter: {
                        userId: currentUser.id,
                        email: currentUser.email,
                        profilePicture: currentUser.profilePicture,
                        username: currentUser.username
                    },
                    likes: []
                }
            }
        }));
        yield postUser.updateOne({
            $push: {
                notifications: {
                    actions: `${currentUser.username} replied your post`,
                    actionUser: {
                        email: currentUser === null || currentUser === void 0 ? void 0 : currentUser.email,
                        username: currentUser === null || currentUser === void 0 ? void 0 : currentUser.username,
                        profilePicture: currentUser === null || currentUser === void 0 ? void 0 : currentUser.profilePicture,
                        userId: currentUser === null || currentUser === void 0 ? void 0 : currentUser.id
                    },
                    actionPostId: post.id,
                    read: false,
                    dateOfAction: new Date().toISOString()
                }
            }
        });
        res.status(200).json("You made a comment");
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const likeComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Posts.findById(req.params.id);
        if (!post) {
            throw new CustomError("Post not found", 404);
        }
        const currentUser = yield Users.findById(req.userId);
        if (!req.userId || !currentUser) {
            throw new CustomError("User not found", 404);
        }
        const reply = post.comments.find(p => { var _a; return ((_a = p._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.body.replyId; });
        if (!reply) {
            throw new CustomError("Reply not found", 404);
        }
        const indexOfReply = post.comments.findIndex(p => { var _a; return ((_a = p._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.body.replyId; });
        if (!(reply === null || reply === void 0 ? void 0 : reply.likes.includes(new Types.ObjectId(req.userId)))) {
            const likesInReply = reply.likes.concat(new Types.ObjectId(req.userId));
            post.comments[indexOfReply].likes = likesInReply;
            const updatedComments = [...post.comments];
            yield post.updateOne({
                $set: {
                    comments: updatedComments
                }
            });
            const targetUser = yield Users.findById(reply.commenter.userId);
            if ((targetUser === null || targetUser === void 0 ? void 0 : targetUser.id) !== req.userId && targetUser) {
                yield targetUser.updateOne({
                    $push: {
                        notifications: {
                            actions: `${currentUser === null || currentUser === void 0 ? void 0 : currentUser.username} liked your comment`,
                            actionUser: {
                                userId: currentUser.id,
                                email: currentUser.email,
                                username: currentUser.username,
                                profilePicture: currentUser.profilePicture
                            },
                            read: false,
                            actionPostId: post.id,
                            dateOfAction: new Date().toISOString()
                        }
                    }
                });
            }
            res.status(200).json("User liked comment!");
        }
        else {
            const likesInReply = reply.likes.filter(id => id !== new Types.ObjectId(req.userId));
            post.comments[indexOfReply].likes = likesInReply;
            const updatedComments = [...post.comments];
            yield post.updateOne({
                $set: {
                    comments: updatedComments
                }
            });
            res.status(403).json("Like removed from comment");
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
//# sourceMappingURL=posts.js.map