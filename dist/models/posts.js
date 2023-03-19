/** @format */
import mongoose, { Types } from "mongoose";
const { Schema, model } = mongoose;
const PostSchema = new Schema({
    linkedUser: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    userId: String,
    description: {
        type: String,
        max: 50,
    },
    image: {
        type: String,
    },
    likes: {
        type: [{
                type: Types.ObjectId,
                ref: "Users"
            }],
        default: []
    },
    comments: {
        type: [{
                comment: String,
                commenter: {
                    userId: {
                        type: String
                    },
                    email: {
                        type: String
                    },
                    username: {
                        type: String
                    },
                    profilePicture: {
                        type: String
                    }
                },
                dateOfReply: String,
                likes: [{
                        type: Types.ObjectId,
                        ref: "Users"
                    }],
            }],
        default: []
    }
}, { timestamps: true });
export default model("Posts", PostSchema);
//# sourceMappingURL=posts.js.map