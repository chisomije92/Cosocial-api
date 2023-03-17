/** @format */
import mongoose, { Types } from "mongoose";
const { Schema, model } = mongoose;
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
        default: "images/transparent-avatar.png",
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
            type: Types.ObjectId,
            ref: "Posts"
        }
    ],
    notifications: [
        {
            actions: { type: String },
            actionUser: {
                username: {
                    type: String
                },
                email: {
                    type: String
                },
                profilePicture: {
                    type: String
                }
            },
            actionPostId: { type: String },
            read: { type: Boolean },
            dateOfAction: { type: String }
        }
    ]
}, { timestamps: true });
export default model("Users", UserSchema);
//# sourceMappingURL=user.js.map