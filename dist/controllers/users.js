/** @format */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { clearImage } from "./../utils/utils.js";
import { validationResult } from "express-validator/src/validation-result.js";
import { CustomError } from "./../error-model/custom-error.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import { resolve } from "path";
const __dirname = resolve();
export const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { isAdmin } = req.body;
    const image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    let imageUrl = image;
    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    }
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const error = new CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
        return res
            .status(error.statusCode)
            .json({ message: error.message, errors: error.errors });
    }
    if (req.userId === req.params.id || isAdmin) {
        try {
            const user = yield User.findById(req.userId);
            if (!user) {
                throw new CustomError("User does not finish", 404);
            }
            if (imageUrl && imageUrl !== user.profilePicture && user.profilePicture.length > 0) {
                clearImage(user.profilePicture, __dirname);
            }
            yield User.findByIdAndUpdate(req.userId, {
                $set: Object.assign(Object.assign({}, req.body), { profilePicture: imageUrl }),
            });
            res.status(200).json("Account updated");
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    }
    else {
        const error = new CustomError("Update not allowed! Not authorized to update account!", 403);
        next(error);
    }
});
export const changePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword } = req.body;
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const error = new CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
        return res
            .status(error.statusCode)
            .json({ message: error.message, errors: error.errors });
    }
    try {
        const user = yield User.findById(req.userId);
        if (!user) {
            const error = new CustomError("User does not exist!", 403);
            throw error;
        }
        const salt = yield bcrypt.genSalt(10);
        const oldHashedPassword = yield bcrypt.hash(oldPassword, salt);
        const isValid = yield bcrypt.compare(oldPassword, user.password);
        if (!isValid) {
            const error = new CustomError("Credentials are incorrect!", 403);
            throw error;
        }
        const isEqual = yield bcrypt.compare(newPassword, oldHashedPassword);
        if (isEqual) {
            const error = new CustomError("Old password is same as new password!", 403);
            throw error;
        }
        const newHashedPassword = yield bcrypt.hash(newPassword, salt);
        user.password = newHashedPassword;
        yield user.save();
        res.status(200).json(user);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { isAdmin } = req.body;
    if (req.userId === req.params.id || isAdmin) {
        try {
            const user = yield User.findByIdAndDelete(req.userId);
            if (!user) {
                throw new CustomError("User does not exist", 404);
            }
            clearImage(user.profilePicture, __dirname);
            return res.status(200).json("Account deletion successful!");
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    }
    else {
        const error = new CustomError("Deletion not allowed! Not authorized to delete account", 403);
        next(error);
    }
});
export const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.params.id);
        if (!user) {
            throw new CustomError("User does not exist", 404);
        }
        const _b = user.toObject(), { password, isAdmin, __v } = _b, rest = __rest(_b, ["password", "isAdmin", "__v"]);
        res.status(200).json(rest);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const getAuthUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.userId).populate({
            path: 'bookmarks',
            populate: [{
                    path: 'linkedUser',
                    model: 'Users',
                    select: "email username profilePicture _id"
                }, {
                    path: 'likes',
                    model: 'Users',
                    select: 'email username profilePicture _id'
                }]
        });
        if (!user) {
            throw new CustomError("User does not exist", 404);
        }
        const _c = user.toObject(), { password, isAdmin, __v } = _c, rest = __rest(_c, ["password", "isAdmin", "__v"]);
        res.status(200).json(rest);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const followUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.userId !== req.params.id) {
        try {
            const userToBeFollowed = yield User.findById(req.params.id);
            const currentUser = yield User.findById(req.userId);
            if (!currentUser) {
                const error = new CustomError("User not found!", 403);
                throw error;
            }
            if (!userToBeFollowed) {
                const error = new CustomError("You cannot follow a non-existing user!", 403);
                throw error;
            }
            if (req.userId) {
                if (!userToBeFollowed.followers.includes(req.userId) && currentUser) {
                    yield userToBeFollowed.updateOne({
                        $push: { followers: req.userId },
                    });
                    yield currentUser.updateOne({ $push: { following: req.params.id } });
                    yield userToBeFollowed.updateOne({
                        $push: {
                            notifications: {
                                actions: `${currentUser.username} followed you`,
                                actionUser: {
                                    email: currentUser.email,
                                    username: currentUser.username,
                                    profilePicture: currentUser.profilePicture,
                                    userId: currentUser.id
                                },
                                read: false,
                                dateOfAction: new Date().toISOString(),
                            },
                        },
                    });
                    res.status(200).json("User has been followed");
                }
                else {
                    const error = new CustomError("You already follow this user!", 403);
                    throw error;
                }
            }
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    }
    else {
        const error = new CustomError("Not allowed to follow yourself!", 403);
        next(error);
    }
});
export const unFollowUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    if (userId !== req.params.id) {
        try {
            const userToBeUnFollowed = yield User.findById(req.params.id);
            const currentUser = yield User.findById(userId);
            if (!currentUser) {
                const error = new CustomError("User not found!", 403);
                throw error;
            }
            if (!userToBeUnFollowed) {
                const error = new CustomError("Can not unfollow a non-existing user!", 403);
                throw error;
            }
            if (userId) {
                if (userToBeUnFollowed.followers.includes(userId) && currentUser) {
                    yield userToBeUnFollowed.updateOne({ $pull: { followers: userId } });
                    yield currentUser.updateOne({ $pull: { following: req.params.id } });
                    return res.status(200).json("You have stopped following this user");
                }
                else {
                    const error = new CustomError("You do not follow this user!", 403);
                    throw error;
                }
            }
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    }
    else {
        const error = new CustomError("You are not allowed to unfollow yourself!", 403);
        next(error);
    }
});
export const getFollowers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield User.findById(id);
        if (!user) {
            const error = new CustomError("User does not exist", 403);
            throw error;
        }
        const createUserObj = (u) => {
            return {
                id: u === null || u === void 0 ? void 0 : u._id,
                username: u === null || u === void 0 ? void 0 : u.username,
                description: u === null || u === void 0 ? void 0 : u.description,
                email: u === null || u === void 0 ? void 0 : u.email,
                followers: u === null || u === void 0 ? void 0 : u.followers,
                following: u === null || u === void 0 ? void 0 : u.following,
                profilePicture: u === null || u === void 0 ? void 0 : u.profilePicture,
            };
        };
        const userFollowers = yield Promise.all(user.followers.map(id => User.findById(id).then(u => createUserObj(u))));
        res.status(200).json(userFollowers);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const getFollowing = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield User.findById(id);
        if (!user) {
            const error = new CustomError("User does not exist", 403);
            throw error;
        }
        const createUserObj = (u) => {
            return {
                id: u === null || u === void 0 ? void 0 : u.id,
                username: u === null || u === void 0 ? void 0 : u.username,
                description: u === null || u === void 0 ? void 0 : u.description,
                email: u === null || u === void 0 ? void 0 : u.email,
                followers: u === null || u === void 0 ? void 0 : u.followers,
                following: u === null || u === void 0 ? void 0 : u.following,
                profilePicture: u === null || u === void 0 ? void 0 : u.profilePicture,
            };
        };
        const userFollowing = yield Promise.all(user.following.map(id => User.findById(id).then(u => createUserObj(u))));
        res.status(200).json(userFollowing);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const getNotFollowing = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.userId);
        if (!user) {
            const error = new CustomError("User does not exist", 403);
            throw error;
        }
        const allUsers = yield User.find();
        const userNotFollowing = allUsers
            .filter(u => {
            return !user.following.includes(u.id) && u.id !== req.userId;
        })
            .map(u => ({
            id: u.id,
            username: u.username,
            description: u.description,
            email: u.email,
            followers: u.followers,
            following: u.following,
            profilePicture: u === null || u === void 0 ? void 0 : u.profilePicture,
        }));
        res.status(200).json(userNotFollowing);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const getNonFollowers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.userId);
        if (!user) {
            const error = new CustomError("User does not exist", 403);
            throw error;
        }
        const allUsers = yield User.find();
        const userNonFollowers = allUsers
            .filter(u => {
            return !user.followers.includes(u.id) && u.id !== req.userId;
        })
            .map(u => ({
            id: u.id,
            username: u.username,
            description: u.description,
            email: u.email,
            followers: u.followers,
            following: u.following,
            profilePicture: u === null || u === void 0 ? void 0 : u.profilePicture,
        }));
        res.status(200).json(userNonFollowers);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const getNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.userId);
        if (!user) {
            const error = new CustomError("User does not exist", 403);
            throw error;
        }
        res.status(200).json(user.notifications);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const readAllNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.userId);
        if (!user) {
            const error = new CustomError("User does not exist", 403);
            throw error;
        }
        const notifications = user.notifications.map((n) => (Object.assign(Object.assign({}, n), { read: true })));
        user.notifications = notifications;
        yield user.save();
        res.status(200).json("Notifications are now marked as read");
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const unreadAllNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.userId);
        if (!user) {
            const error = new CustomError("User does not exist", 403);
            throw error;
        }
        const notifications = user.notifications.map((n) => (Object.assign(Object.assign({}, n), { read: false })));
        user.notifications = notifications;
        yield user.save();
        res.status(200).json("Notifications are now marked as unread");
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const singleNotificationRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.userId);
        if (!user) {
            const error = new CustomError("User does not exist", 403);
            throw error;
        }
        const notifications = [...user.notifications];
        const notification = notifications.find(n => n._id.toString() == req.params.id);
        if (notification) {
            const updatedNotification = Object.assign(Object.assign({}, notification), { read: true });
            const notificationIndex = notifications.findIndex(n => n._id.toString() == req.params.id);
            notifications[notificationIndex] = Object.assign({}, updatedNotification);
            user.notifications = notifications;
            yield user.save();
        }
        else {
            throw new CustomError("Notification not found", 404);
        }
        res.status(200).json("Notification marked as read");
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
//# sourceMappingURL=users.js.map