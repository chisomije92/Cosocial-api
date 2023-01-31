import { CustomError } from './../error-model/custom-error';
import Posts from "../models/posts";
import { Request, Response, NextFunction } from "express";
import User from "../models/user";

export const createPosts = async (req: Request, res: Response, next: NextFunction) => {

  const newPost = new Posts({ ...req.body, userId: req.userId })

  try {
    const savedPost = await newPost.save()
    res.status(200).json(savedPost)
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const post = await Posts.findById(req.params.id)
    if (post?.userId === req.userId) {
      await post?.updateOne({
        $set: req.body
      })
      res.status(200).json("Post updated successfully")

    } else {
      const error = new CustomError("You can only update posts made by you!", 403);
      throw error;
    }
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const post = await Posts.findById(req.params.id)
    if (!post) {
      const error = new CustomError("Post not found!", 403);
      throw error;
    }
    if (post.userId === req.userId) {
      await post?.deleteOne()
      res.status(200).json("Post deleted successfully")

    } else {
      const error = new CustomError("You can only delete posts made by you!", 403);
      throw error;
    }
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const likePost = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const post = await Posts.findById(req.params.id)
    if (!post) {
      const error = new CustomError("Post not found!", 403);
      throw error;
    }
    if (req.userId) {
      if (!post?.likes.includes(req.userId)) {
        await post?.updateOne({ $push: { likes: req.userId } })
        res.status(200).json("User liked post!")

      } else {
        await post.updateOne({ $pull: { likes: req.userId } })
        res.status(403).json("Like removed from post")
      }
    }

  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Posts.findById(req.params.id)
    res.status(200).json(post)

  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const getPostsOnTL = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = await User.findById(req.params.id)
    const userPosts = await Posts.find({ userId: currentUser?._id })
    if (!currentUser) {
      const error = new CustomError("User not found!", 404);
      throw error;
    }
    const friendPosts = await Promise.all<any[]>(
      currentUser.following.map(friendId => { return Posts.find({ userId: friendId }) })
    )
    res.status(200).json(userPosts.concat(...friendPosts))

  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}