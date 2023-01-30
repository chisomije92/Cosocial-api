"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        min: 5,
        max: 20,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 6,
    },
    profilePicture: {
        type: String,
        default: "",
    },
    coverPicture: {
        type: String,
        default: "",
    },
    followers: {
        type: [Number],
        default: [],
    },
    following: {
        type: [Number],
        default: [],
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.default = model("Users", UserSchema);
//# sourceMappingURL=user.js.map