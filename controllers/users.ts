import { Request, Response, NextFunction } from "express";
import User from "../models/user"
import bcrypt from "bcrypt"

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, password, isAdmin } = req.body

  if (userId === req.params.id || isAdmin) {
    if (password) {
      try {
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(password, salt)

      } catch (err) {
        return res.status(500).json(err)
      }
    }
    try {
      const user = await User.findByIdAndUpdate(userId, {
        $set: req.body
      })
      res.status(200).json("Account updated!")
    } catch (err) {
      return res.status(500).json(err)
    }

  } else {
    return res.status(403).json("Update not allowed! Not authorized to update account!")
  }
}
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, isAdmin } = req.body

  if (userId === req.params.id || isAdmin) {


    try {
      const user = await User.findByIdAndDelete(userId)
      res.status(200).json("Account deletion successful!")
    } catch (err) {
      return res.status(500).json(err)
    }

  } else {
    return res.status(403).json("Deletion not allowed! Not authorized to delete account!")
  }
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id)
    const { password, updatedAt, isAdmin, _id, __v, ...rest } = user!.toObject()
    res.status(200).json(rest)

  } catch (err) {
    res.status(500).json(err)
  }
}