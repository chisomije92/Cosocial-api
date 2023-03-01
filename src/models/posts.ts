/** @format */

import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

interface Reply {
  post: string;
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
      post: String,
      commenterId: String,
      dateOfReply: String,
    }],
    default: []
  }
},
  { timestamps: true }
);

export default model<PostType>("Posts", PostSchema);