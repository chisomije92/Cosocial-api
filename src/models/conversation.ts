/** @format */

import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

export interface ConversationType extends mongoose.Document {
	_id?: Types.ObjectId;
	members: string[]
}

const ConversationSchema = new Schema(
	{
		members: {
			type: Array
		}
	},
	{ timestamps: true }
);

export default model<ConversationType>("conversation", ConversationSchema);
