
/** @format */

import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

interface Reply {
  _id?: Types.ObjectId;
  comment: string;
  commenter: {
    userId: string;
    profilePicture: string;
    email: string;
    username: string
  }
  dateOfReply: string
  likes: Types.ObjectId[];
}

export interface PostType extends mongoose.Document {
  _id?: Types.ObjectId;
  userId: string;
  linkedUser: Types.ObjectId;
  description: string;
  image: string;
  likes: Types.ObjectId[];
  comments: Reply[]
  updatedAt: string;
  createdAt: string

}

const PostSchema = new Schema<PostType>({

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
},
  { timestamps: true }
);

export default model<PostType>("Posts", PostSchema);