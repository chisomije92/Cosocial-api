import Posts from "../models/posts";
import { Request, Response, NextFunction } from "express";
import User from "../models/user";

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
      res.status(200).json("Post updated successfully")

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
    if (!post) {
      return res.status(403).json("Post not found!")
    }
    if (post.userId === req.body.userId) {
      await post?.deleteOne()
      res.status(200).json("Post deleted successfully")

    } else {
      res.status(403).json("You can only delete posts made by you")
    }
  } catch (err) {
    res.status(500).json(err)
  }

}

export const likePost = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const post = await Posts.findById(req.params.id)
    if (!post?.likes.includes(req.body.userId)) {
      await post?.updateOne({ $push: { likes: req.body.userId } })
      res.status(200).json("User liked post!")

    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } })
      res.status(403).json("Like removed from post")
    }
  } catch (err) {
    res.status(500).json(err)
  }

}

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Posts.findById(req.params.id)
    res.status(200).json(post)

  } catch (err) {
    res.status(500).json(err)
  }

}

export const getPostsOnTL = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = await User.findById(req.params.id)
    const userPosts = await Posts.find({ userId: currentUser?._id })
    if (!currentUser) {
      return res.status(403).json("No user found!")
    }
    const friendPosts = await Promise.all<any[]>(
      currentUser.following.map(friendId => { return Posts.find({ userId: friendId }) })
    )
    res.status(200).json(userPosts.concat(...friendPosts))

  } catch (err) {
    res.status(500).json(err)
  }

}