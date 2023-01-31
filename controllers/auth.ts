import { CustomError } from '../error-model/custom-error';
import { Request, Response, NextFunction } from "express";
import User from "../models/user"
import bcrypt from "bcrypt"
import { validationResult } from 'express-validator/src/validation-result';


export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    const error = new CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
    return res.status(error.statusCode).json({ message: error.message, errors: error.errors })
  }
  const { email, password, username } = req.body
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword
    })
    await newUser.save().then((data) => res.status(200).json(data))

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
      const error = new CustomError("User not found!", 404);
      throw error;
    }
    const validPassword = await bcrypt.compare(password, user!.password)
    !validPassword && res.status(400).json("User credentials are incorrect!")
    res.status(200).json(user)
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}