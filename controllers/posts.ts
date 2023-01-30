import Posts from "../models/posts";
import { Request, Response, NextFunction } from "express";

export const createPosts = async (req: Request, res: Response, next: NextFunction) => {

  const newPost = await new Posts(req.body)

  try {
    const savedPost = await newPost.save()
    res.status(200).json(savedPost)
  } catch (err) {
    res.status(500).json(err)
  }

}

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const post = await Posts.findById(req.params.id)
    if (post?.userId === req.body.userId) {
      await post?.updateOne({
        $set: req.body
      })
      res.status(200).json("Post created successfully")

    } else {
      res.status(403).json("You can only update posts made by you")
    }
  } catch (err) {
    res.status(500).json(err)
  }

}

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const post = await Posts.findById(req.params.id)
    if (post?.userId === req.body.userId) {
      await post?.deleteOne()
      res.status(200).json("Post deleted successfully")

    } else {
      res.status(403).json("You can only delete posts made by you")
    }
  } catch (err) {
    res.status(500).json(err)
  }

}