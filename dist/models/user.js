"use strict";
/** @format */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
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
    followers: {
        type: [String],
        default: [],
    },
    following: {
        type: [String],
        default: [],
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
        max: 50,
        default: ""
    },
    city: {
        type: String,
        max: 50,
        default: ""
    },
    from: {
        type: String,
        max: 50,
        default: ""
    },
    relationship: {
        type: Number,
        enum: [1, 2, 3],
        default: 1
    },
    bookmarks: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "Posts"
        }
    ],
    notifications: [
        {
            actions: { type: String },
            read: { type: Boolean },
            dateOfAction: { type: String }
        }
    ]
}, { timestamps: true });
exports.default = model("Users", UserSchema);
//# sourceMappingURL=user.js.map