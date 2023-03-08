import { clearImage } from './../utils/utils.js';
import { validationResult } from 'express-validator/src/validation-result.js';
import { CustomError } from './../error-model/custom-error.js';
import { Request, Response, NextFunction } from "express";
import User from "../models/user.js"
import bcrypt from "bcrypt"
import { join, resolve } from 'path';
import { unlink } from 'fs';



const __dirname = resolve()

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { description, email, username, isAdmin } = req.body
  const image = req.file?.path;


  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    const error = new CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
    return res.status(error.statusCode).json({ message: error.message, errors: error.errors })
  }

  if (req.userId === req.params.id || isAdmin) {

    try {
      const user = await User.findById(req.userId)
      if (!user) {
        throw new CustomError("User not found!", 404)
      }
      if (image !== user.profilePicture && image) {
        clearImage(user.profilePicture, __dirname)
        user.profilePicture = image
      }

      await User.findByIdAndUpdate(req.userId, {
        $set: {
          ...req.body,
          profilePicture: image
        }
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
      if (!user) {
        throw new CustomError("User not found!", 404)
      }
      clearImage(user.profilePicture, __dirname)
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
    if (!user) {
      throw new CustomError("User not found", 404)
    }
    const { password, isAdmin, __v, ...rest } = user.toObject()
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

      const userToBeFollowed = await User.findById(req.params.id)
      const currentUser = await User.findById(req.userId)
      if (!currentUser) {
        const error = new CustomError("User not found!", 403);
        throw error;
      }
      if (!userToBeFollowed) {
        const error = new CustomError("You cannot follow a non-existing user!", 403);
        throw error;
      }


      if (req.userId) {
        if (!userToBeFollowed.followers.includes(req.userId) && currentUser) {
          await userToBeFollowed.updateOne({ $push: { followers: req.userId } })
          await currentUser.updateOne({ $push: { following: req.params.id } })
          await userToBeFollowed.updateOne({
            $push: {
              notifications: {
                actions: `${currentUser.username} followed you`,
                actionUserId: currentUser.id,
                read: false,
                dateOfAction: new Date().toISOString()
              }
            }
          })
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
      const userToBeUnFollowed = await User.findById(req.params.id)
      const currentUser = await User.findById(userId)
      if (!currentUser) {
        const error = new CustomError("User not found!", 403);
        throw error;
      }
      if (!userToBeUnFollowed) {
        const error = new CustomError("Can not unfollow a non-existing user!", 403);
        throw error;
      }

      if (userId) {
        if (userToBeUnFollowed.followers.includes(userId) && currentUser) {

          await userToBeUnFollowed.updateOne({ $pull: { followers: userId } })
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

export const getFollowers = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { id } = req.params
    const user = await User.findById(id)

    if (!user) {
      const error = new CustomError("User not found!", 403);
      throw error
    }
    const createUserObj = (u: any) => {
      return { id: u?._id, username: u?.username, description: u?.description, email: u?.email, followers: u?.followers, following: u?.following, profilePicture: u?.profilePicture }
    }
    const userFollowers = await Promise.all<any[]>(user.followers.map((id) => User.findById(id).then(u => (createUserObj(u)))))

    res.status(200).json(userFollowers)
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}

export const getFollowing = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { id } = req.params
    const user = await User.findById(id)

    if (!user) {
      const error = new CustomError("User not found!", 403);
      throw error
    }
    const createUserObj = (u: any) => {
      return { id: u?._id, username: u?.username, description: u?.description, email: u?.email, followers: u?.followers, following: u?.following, profilePicture: u?.profilePicture }
    }
    const userFollowing = await Promise.all<any[]>(user.following.map((id) => User.findById(id).then(u => (createUserObj(u)))))

    res.status(200).json(userFollowing)
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      const error = new CustomError("User not found!", 403);
      throw error
    }
    res.status(200).json(user.notifications)
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }


}

