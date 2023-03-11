import dotenv from 'dotenv';
import { CustomError } from '../error-model/custom-error.js';
import { Request, Response, NextFunction } from "express";
import User from "../models/user.js"
import bcrypt from "bcrypt"
import { validationResult } from 'express-validator/src/validation-result.js';
//import { sign } from 'jsonwebtoken';
//const { sign } = require("jsonwebtoken")
import jsonwebtoken from "jsonwebtoken"

const { sign } = jsonwebtoken

dotenv.config()
const { JWT_SECRET } = process.env
let secret: string
if (JWT_SECRET) {
  secret = JWT_SECRET
} else {
  throw new Error("JWT_SECRET is not set");
}

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {

  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    const error = new CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
    return res.status(error.statusCode).json({ message: error.message, errors: error.errors })
  }
  const { email, password, username } = req.body
  try {
    const existingEmail = await User.findOne({ email: email })
    if (existingEmail) {
      const error = new CustomError("User exists already", 409)
      throw error
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword
    })
    const savedUser = await newUser.save()
    const token = sign({
      email: savedUser.email,
      userId: savedUser._id.toString()
    }, secret, { expiresIn: '1h' })
    res.status(200).json({ token, userId: savedUser._id.toString() })


  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}




export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    const error = new CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
    return res.status(error.statusCode).json({ message: error.message, errors: error.errors })
  }
  try {
    const user = await User.findOne({ email: email })
    if (!user) {
      const error = new CustomError("User does not exist", 404);
      throw error;
    }
    const validPassword = await bcrypt.compare(password, user!.password)
    if (!validPassword) {
      const error = new CustomError("Credentials are invalid!", 400);
      throw error;

    }
    const token = sign({
      email: user.email,
      userId: user._id.toString()
    }, secret, { expiresIn: '1h' })
    res.status(200).json({ token, userId: user._id.toString() })
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}