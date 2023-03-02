/** @format */

import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

interface Reply {
  _id?: Types.ObjectId;
  comment: string;
  commenterId: string
  dateOfReply: string
  likes: string[];
}

export interface PostType extends mongoose.Document {
  _id?: Types.ObjectId;
  userId: string;
  description: string;
  image: string;
  likes: string[];
  comments: Reply[]
  updatedAt: string;
  createdAt: string

}

const PostSchema = new Schema<PostType>({
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
      comment: String,
      commenterId: String,
      dateOfReply: String,
      likes: [String],
    }],
    default: []
  }
},
  { timestamps: true }
);

export default model<PostType>("Posts", PostSchema);