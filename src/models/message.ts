import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

export interface MessageType extends mongoose.Document {
  _id?: Types.ObjectId;
  conversationId: string;
  sender: string;
  text: string;

}

const MessageSchema = new Schema({
  conversationId: String,
  sender: String,
  text: String,


},
  { timestamps: true }
)

export default model<MessageType>("Messages", MessageSchema);