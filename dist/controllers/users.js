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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = exports.unFollowUser = exports.followUser = exports.getUser = exports.deleteUser = exports.changePassword = exports.updateUser = void 0;
const validation_result_1 = require("express-validator/src/validation-result");
const custom_error_1 = require("./../error-model/custom-error");
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, isAdmin } = req.body;
    const validationErrors = (0, validation_result_1.validationResult)(req);
    if (!validationErrors.isEmpty()) {
        const error = new custom_error_1.CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
        return res.status(error.statusCode).json({ message: error.message, errors: error.errors });
    }
    if (req.userId === req.params.id || isAdmin) {
        try {
            const user = yield user_1.default.findByIdAndUpdate(req.userId, {
                $set: req.body
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
        const error = new custom_error_1.CustomError("Update not allowed! Not authorized to update account!", 403);
        next(error);
    }
});
exports.updateUser = updateUser;
const changePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword } = req.body;
    const validationErrors = (0, validation_result_1.validationResult)(req);
    if (!validationErrors.isEmpty()) {
        const error = new custom_error_1.CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
        return res.status(error.statusCode).json({ message: error.message, errors: error.errors });
    }
    try {
        const user = yield user_1.default.findById(req.userId);
        if (!user) {
            const error = new custom_error_1.CustomError("User does not exist!", 403);
            throw error;
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const oldHashedPassword = yield bcrypt_1.default.hash(oldPassword, salt);
        const isValid = yield bcrypt_1.default.compare(oldPassword, user.password);
        if (!isValid) {
            const error = new custom_error_1.CustomError("Credentials are incorrect!", 403);
            throw error;
        }
        const isEqual = yield bcrypt_1.default.compare(newPassword, oldHashedPassword);
        if (isEqual) {
            const error = new custom_error_1.CustomError("Old password is same as new password!", 403);
            throw error;
        }
        const newHashedPassword = yield bcrypt_1.default.hash(newPassword, salt);
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
exports.changePassword = changePassword;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { isAdmin } = req.body;
    if (req.userId === req.params.id || isAdmin) {
        try {
            const user = yield user_1.default.findByIdAndDelete(req.userId);
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
        const error = new custom_error_1.CustomError("Deletion not allowed! Not authorized to delete account", 403);
        next(error);
    }
});
exports.deleteUser = deleteUser;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.params.id);
        const _a = user.toObject(), { password, updatedAt, isAdmin, __v } = _a, rest = __rest(_a, ["password", "updatedAt", "isAdmin", "__v"]);
        res.status(200).json(rest);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.getUser = getUser;
const followUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.userId !== req.params.id) {
        try {
            const userToBeFollowed = yield user_1.default.findById(req.params.id);
            const currentUser = yield user_1.default.findById(req.userId);
            if (!currentUser) {
                const error = new custom_error_1.CustomError("User not found!", 403);
                throw error;
            }
            if (!userToBeFollowed) {
                const error = new custom_error_1.CustomError("You cannot follow a non-existing user!", 403);
                throw error;
            }
            if (req.userId) {
                if (!userToBeFollowed.followers.includes(req.userId) && currentUser) {
                    yield userToBeFollowed.updateOne({ $push: { followers: req.userId } });
                    yield currentUser.updateOne({ $push: { following: req.params.id } });
                    yield userToBeFollowed.updateOne({
                        $push: {
                            notifications: {
                                actions: `${currentUser.username} followed you`,
                                read: false,
                                dateOfAction: new Date().toISOString()
                            }
                        }
                    });
                    res.status(200).json('User has been followed');
                }
                else {
                    const error = new custom_error_1.CustomError("You already follow this user!", 403);
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
        const error = new custom_error_1.CustomError("Not allowed to follow yourself!", 403);
        next(error);
    }
});
exports.followUser = followUser;
const unFollowUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    if (userId !== req.params.id) {
        try {
            const userToBeUnFollowed = yield user_1.default.findById(req.params.id);
            const currentUser = yield user_1.default.findById(userId);
            if (!currentUser) {
                const error = new custom_error_1.CustomError("User not found!", 403);
                throw error;
            }
            if (!userToBeUnFollowed) {
                const error = new custom_error_1.CustomError("Can not unfollow a non-existing user!", 403);
                throw error;
            }
            if (userId) {
                if (userToBeUnFollowed.followers.includes(userId) && currentUser) {
                    yield userToBeUnFollowed.updateOne({ $pull: { followers: userId } });
                    yield currentUser.updateOne({ $pull: { following: req.params.id } });
                    return res.status(200).json('You have stopped following this user');
                }
                else {
                    const error = new custom_error_1.CustomError("You do not follow this user!", 403);
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
        const error = new custom_error_1.CustomError("You are not allowed to unfollow yourself!", 403);
        next(error);
    }
});
exports.unFollowUser = unFollowUser;
const getNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.userId);
        if (!user) {
            const error = new custom_error_1.CustomError("User not found!", 403);
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
exports.getNotifications = getNotifications;
//# sourceMappingURL=users.js.map