/** @format */
import mongoose from "mongoose";
const { Schema, model } = mongoose;
const PostSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        max: 50,
    },
    image: {
        type: String,
    },
    likes: {
        type: [String],
        default: []
    },
    comments: {
        type: [{
                reply: String,
                commenterId: String,
                dateOfReply: String,
                likes: [String],
            }],
        default: []
    }
}, { timestamps: true });
export default model("Posts", PostSchema);
//# sourceMappingURL=posts.js.map