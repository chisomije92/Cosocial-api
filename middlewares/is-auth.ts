import { CustomError } from './../error-model/custom-error';
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();
let secret: string;

if (process.env.JWT_SECRET) {
  secret = process.env.JWT_SECRET;
} else {
  throw new Error("JWT_SECRET is not set");
}

export default (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new CustomError("Not authenticated", 401);
    throw error;
  }
  const token: string = authHeader.split(" ")[1];
  let decodedToken: any;
  try {
    decodedToken = jwt.verify(token, secret);
  } catch (err: any) {
    err.statusCode = 500;
    next(err);
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated");
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};