import { validationResult } from 'express-validator/src/validation-result';
import { CustomError } from './../error-model/custom-error';
import { Request, Response, NextFunction } from "express";
import User from "../models/user"
import bcrypt from "bcrypt"

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { password, isAdmin } = req.body
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    const error = new CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
    return res.status(error.statusCode).json({ message: error.message, errors: error.errors })
  }

  if (req.userId === req.params.id || isAdmin) {

    try {
      const user = await User.findByIdAndUpdate(req.userId, {
        $set: req.body
      })
      res.status(200).json("Account updated")
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

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  const { oldPassword, newPassword } = req.body
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    const error = new CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
    return res.status(error.statusCode).json({ message: error.message, errors: error.errors })
  }
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      const error = new CustomError("User does not exist!", 403);
      throw error;
    }

    const salt = await bcrypt.genSalt(10)
    const oldHashedPassword = await bcrypt.hash(oldPassword, salt);
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      const error = new CustomError("Credentials are incorrect!", 403);
      throw error;
    }
    const isEqual = await bcrypt.compare(newPassword, oldHashedPassword);
    if (isEqual) {
      const error = new CustomError("Old password is same as new password!", 403);
      throw error;
    }
    const newHashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = newHashedPassword;
    await user.save()
    res.status(200).json(user)
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }


}



export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { isAdmin } = req.body

  if (req.userId === req.params.id || isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.userId)
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
  if (req.userId !== req.params.id) {
    try {

      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.userId)
      if (!currentUser) {
        const error = new CustomError("User not found!", 403);
        throw error;
      }
      if (!user) {
        const error = new CustomError("You cannot follow a non-existing user!", 403);
        throw error;
      }


      if (req.userId) {
        if (!user.followers.includes(req.userId) && currentUser) {
          await user.updateOne({ $push: { followers: req.userId } })
          await currentUser.updateOne({ $push: { following: req.params.id } })
          res.status(200).json('User has been followed')
        } else {
          const error = new CustomError("You already follow this user!", 403);
          throw error;
        }
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
  const { userId } = req
  if (userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(userId)
      if (!currentUser) {
        const error = new CustomError("User not found!", 403);
        throw error;
      }
      if (!user) {
        const error = new CustomError("Can not unfollow a non-existing user!", 403);
        throw error;
      }

      if (userId) {
        if (user.followers.includes(userId) && currentUser) {

          await user.updateOne({ $pull: { followers: userId } })
          await currentUser.updateOne({ $pull: { following: req.params.id } })
          return res.status(200).json('You have stopped following this user')
        } else {
          const error = new CustomError("You do not follow this user!", 403);
          throw error;
        }
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
