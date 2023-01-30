/** @format */

import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

export interface UserType extends mongoose.Document {
  _id?: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  coverPicture: string;
  followers: number[];
  following: number[];
  isAdmin: boolean;
  description: string;
  city: string;
  from: string;
  relationship: Number

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
  description: {
    type: String,
    max: 50,
    default: ""
  },
  city: {
    type: String,
    max: 50,
    default: ""
  },
  from: {
    type: String,
    max: 50,
    default: ""
  },
  relationship: {
    type: Number,
    enum: [1, 2, 3],
    default: 1
  }
},
  { timestamps: true }
);

export default model<UserType>("Users", UserSchema);