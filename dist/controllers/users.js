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
exports.unFollowUser = exports.followUser = exports.getUser = exports.deleteUser = exports.updateUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, password, isAdmin } = req.body;
    if (userId === req.params.id || isAdmin) {
        if (password) {
            try {
                const salt = yield bcrypt_1.default.genSalt(10);
                req.body.password = yield bcrypt_1.default.hash(password, salt);
            }
            catch (err) {
                return res.status(500).json(err);
            }
        }
        try {
            const user = yield user_1.default.findByIdAndUpdate(userId, {
                $set: req.body
            });
            res.status(200).json("Account updated!");
        }
        catch (err) {
            return res.status(500).json(err);
        }
    }
    else {
        return res.status(403).json("Update not allowed! Not authorized to update account!");
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, isAdmin } = req.body;
    if (userId === req.params.id || isAdmin) {
        try {
            const user = yield user_1.default.findByIdAndDelete(userId);
            return res.status(200).json("Account deletion successful!");
        }
        catch (err) {
            return res.status(500).json(err);
        }
    }
    else {
        return res.status(403).json("Deletion not allowed! Not authorized to delete account!");
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
        res.status(500).json(err);
    }
});
exports.getUser = getUser;
const followUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    if (userId !== req.params.id) {
        try {
            const user = yield user_1.default.findById(req.params.id);
            const currentUser = yield user_1.default.findById(req.body.userId);
            if (!currentUser) {
                return res.status(403).json('User not found!');
            }
            if (!user) {
                return res.status(403).json('Cannot follow a non-existing user');
            }
            if (!user.followers.includes(req.body.userId) && currentUser) {
                yield user.updateOne({ $push: { followers: req.body.userId } });
                yield currentUser.updateOne({ $push: { following: req.params.id } });
                res.status(200).json('User has been followed');
            }
            else {
                return res.status(403).json('You already follow this user');
            }
        }
        catch (err) {
            return res.status(500).json(err);
        }
    }
    else {
        res.status(403).json("Not allowed to follow yourself");
    }
});
exports.followUser = followUser;
const unFollowUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    if (userId !== req.params.id) {
        try {
            const user = yield user_1.default.findById(req.params.id);
            const currentUser = yield user_1.default.findById(req.body.userId);
            if (!currentUser) {
                return res.status(403).json('User not found!');
            }
            if (!user) {
                return res.status(403).json('Cannot unfollow a non-existing user');
            }
            if (user.followers.includes(req.body.userId) && currentUser) {
                yield user.updateOne({ $pull: { followers: req.body.userId } });
                yield currentUser.updateOne({ $pull: { following: req.params.id } });
                return res.status(200).json('You have stopped following this user');
            }
            else {
                return res.status(403).json('You do not follow this user');
            }
        }
        catch (err) {
            return res.status(500).json(err);
        }
    }
    else {
        res.status(403).json("Not allowed to unfollow yourself");
    }
});
exports.unFollowUser = unFollowUser;
//# sourceMappingURL=users.js.map