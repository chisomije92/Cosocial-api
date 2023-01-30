/** @format */

import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

export interface UserType {
  _id?: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  coverPicture: string;
  followers: number[];
  following: number[];
  isAdmin: boolean;
}

const UserSchema = new Schema<UserType>({
  username: {
    type: String,
    required: true,
    min: 5,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  coverPicture: {
    type: String,
    default: "",
  },

  followers: {
    type: [Number],
    default: [],
  },

  following: {
    type: [Number],
    default: [],
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },
},
  { timestamps: true }
);

export default model<UserType>("Users", UserSchema);