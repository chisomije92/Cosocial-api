import mongoose from "mongoose";
const { Schema, model } = mongoose;
const MessageSchema = new Schema({
    conversationId: String,
    sender: String,
    text: String,
}, { timestamps: true });
export default model("Messages", MessageSchema);
//# sourceMappingURL=messages.js.map