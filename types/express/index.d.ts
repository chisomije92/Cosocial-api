import express from "express";


interface UserType {
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

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, UserType> | null;
      isAdmin?: boolean;
    }
  }
}