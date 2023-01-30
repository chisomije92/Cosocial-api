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
      return res.status(200).json("Account deletion successful!")
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
    const { password, updatedAt, isAdmin, __v, ...rest } = user!.toObject()
    res.status(200).json(rest)

  } catch (err) {
    res.status(500).json(err)
  }
}

export const followUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body
  if (userId !== req.params.id) {
    try {

      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.body.userId)
      if (!currentUser) {
        return res.status(403).json('User not found!')
      }
      if (!user) {
        return res.status(403).json('Cannot follow a non-existing user')
      }

      if (!user.followers.includes(req.body.userId) && currentUser) {

        await user.updateOne({ $push: { followers: req.body.userId } })
        await currentUser.updateOne({ $push: { following: req.params.id } })
        res.status(200).json('User has been followed')
      } else {
        return res.status(403).json('You already follow this user')
      }
    } catch (err) {
      return res.status(500).json(err)
    }

  } else {
    res.status(403).json("Not allowed to follow yourself")
  }
}

export const unFollowUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body
  if (userId !== req.params.id) {
    try {

      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.body.userId)
      if (!currentUser) {
        return res.status(403).json('User not found!')
      }
      if (!user) {
        return res.status(403).json('Cannot unfollow a non-existing user')
      }

      if (user.followers.includes(req.body.userId) && currentUser) {

        await user.updateOne({ $pull: { followers: req.body.userId } })
        await currentUser.updateOne({ $pull: { following: req.params.id } })
        return res.status(200).json('You have stopped following this user')
      } else {
        return res.status(403).json('You do not follow this user')
      }
    } catch (err) {
      return res.status(500).json(err)
    }

  } else {
    res.status(403).json("Not allowed to unfollow yourself")
  }
}
