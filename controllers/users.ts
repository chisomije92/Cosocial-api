import { CustomError } from './../error-model/custom-error';
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

      } catch (err: any) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err)
      }
    }
    try {
      const user = await User.findByIdAndUpdate(userId, {
        $set: req.body
      })
      res.status(200).json("Account updated!")
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err)
    }

  } else {
    const error = new CustomError("Update not allowed! Not authorized to update account!", 403);
    next(error);
  }
}



export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, isAdmin } = req.body

  if (userId === req.params.id || isAdmin) {
    try {
      const user = await User.findByIdAndDelete(userId)
      return res.status(200).json("Account deletion successful!")
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err)
    }

  } else {
    const error = new CustomError("Deletion not allowed! Not authorized to delete account", 403);
    next(error);
  }
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id)
    const { password, updatedAt, isAdmin, __v, ...rest } = user!.toObject()
    res.status(200).json(rest)

  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}

export const followUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body
  if (userId !== req.params.id) {
    try {

      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.body.userId)
      if (!currentUser) {
        const error = new CustomError("User not found!", 403);
        throw error;
      }
      if (!user) {
        const error = new CustomError("You cannot follow a non-existing user!", 403);
        throw error;
      }

      if (!user.followers.includes(req.body.userId) && currentUser) {

        await user.updateOne({ $push: { followers: req.body.userId } })
        await currentUser.updateOne({ $push: { following: req.params.id } })
        res.status(200).json('User has been followed')
      } else {
        const error = new CustomError("You already follow this user!", 403);
        throw error;
      }
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err)
    }

  } else {
    const error = new CustomError("Not allowed to follow yourself!", 403);
    next(error);
  }
}

export const unFollowUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body
  if (userId !== req.params.id) {
    try {

      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.body.userId)
      if (!currentUser) {
        const error = new CustomError("User not found!", 403);
        throw error;
      }
      if (!user) {
        const error = new CustomError("Can not unfollow a non-existing user!", 403);
        throw error;
      }

      if (user.followers.includes(req.body.userId) && currentUser) {

        await user.updateOne({ $pull: { followers: req.body.userId } })
        await currentUser.updateOne({ $pull: { following: req.params.id } })
        return res.status(200).json('You have stopped following this user')
      } else {
        const error = new CustomError("You do not follow this user!", 403);
        throw error;
      }
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err)
    }

  } else {
    const error = new CustomError("You are not allowed to unfollow yourself!", 403);
    next(error);
  }
}
