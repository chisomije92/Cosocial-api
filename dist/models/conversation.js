/** @format */
import mongoose from "mongoose";
const { Schema, model } = mongoose;
const ConversationSchema = new Schema({
    members: {
        type: Array,
    },
    messages: {
        type: [
            {
                senderId: String,
                receiverId: String,
                text: String,
                dateOfAction: String
            }
        ],
    }
}, { timestamps: true });
export default model("conversation", ConversationSchema);
//# sourceMappingURL=conversation.js.map