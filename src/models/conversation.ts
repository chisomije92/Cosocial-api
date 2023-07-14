/** @format */

import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

export interface ConversationType extends mongoose.Document {
	_id?: Types.ObjectId;
	members: string[]
	messages: {
		_id?: Types.ObjectId;
		senderId: string;
		receiverId: string;
		text: string;
		dateOfAction: string
	}[]
}

const ConversationSchema = new Schema(
	{
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

	},

	{ timestamps: true }
);

export default model<ConversationType>("conversation", ConversationSchema);
