import { CustomError } from '../error-model/custom-error';
import { Request, Response, NextFunction } from "express";
import User from "../models/user"
import bcrypt from "bcrypt"


export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
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
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      const error = new CustomError("User not found!", 404);
      throw error;
    }
    const validPassword = await bcrypt.compare(req.body.password, user!.password)
    !validPassword && res.status(400).json("User credentials are incorrect!")
    res.status(200).json(user)
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}