/** @format */

import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

export interface PostType extends mongoose.Document {
  _id?: Types.ObjectId;
  userId: string;
  description: string;
  img: string;
  likes: any[];


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

  img: {
    type: String,
  },
  likes: {
    type: [String],
    default: []
  },
},
  { timestamps: true }
);

export default model<PostType>("Posts", PostSchema);