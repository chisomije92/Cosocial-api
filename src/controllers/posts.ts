import { join, resolve } from 'path';

import { CustomError } from './../error-model/custom-error.js';
import Posts from "../models/posts.js";
import { Request, Response, NextFunction } from "express";
import Users from "../models/user.js";
import { clearImage } from '../utils/utils.js';
import { Types } from 'mongoose';
import { getIO } from "../socket/index.js";



const __dirname = resolve()
export const createPosts = async (req: Request, res: Response, next: NextFunction) => {
  const image = req.file?.path;
  const description: string = req.body.description;

  let imageUrl = image
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }

  try {
    const newPost = new Posts({ description, image: imageUrl, userId: req.userId, linkedUser: req.userId })
    const savedPost = await newPost.save()
    const user = await Users.findById(req.userId);
    if (!user) {
      throw new CustomError("User does not exist", 404)
    }
    getIO().emit("posts", {
      action: "create",
      post: {
        ...savedPost.toObject(),
        linkedUser: {
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          _id: user._id
        },
      }
    })
    res.status(200).json(savedPost)
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {

  const updatedDescription = req.body.description
  const updatedImage = req.file?.path;
  let imageUrl = updatedImage
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  try {
    const post = await Posts.findById(req.params.id)
    if (!post) {
      throw new CustomError("Post does not exist", 404)
    }
    if (post.userId.toString() === req.userId) {

      post.description = updatedDescription

      if (imageUrl && imageUrl !== post.image && post.image.length > 0) {
        clearImage(post.image, __dirname)
        post.image = imageUrl
      }
      await post.save()
      const user = await Users.findById(req.userId);
      if (!user) {
        throw new CustomError("User does not exist", 404)
      }
      getIO().emit("posts", {
        action: "update",
        post: {
          ...post.toObject(),
          linkedUser: {
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            _id: user._id
          },
        }
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
      const error = new CustomError("Post does not exist!", 404);
      throw error;
    }
    if (post.userId === req.userId) {
      if (post.image) {
        clearImage(post.image, __dirname)
      }

      await post.deleteOne()
      const user = await Users.findById(req.userId);
      if (!user) {
        throw new CustomError("User does not exist", 404)
      }
      getIO().emit("posts", {
        action: "delete",
        post: {
          ...post.toObject(),
        }
      })
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

export const getUserPosts = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const query = [
      {
        path: 'linkedUser',
        select: 'username email profilePicture _id'
      },
      {
        path: 'likes',
        select: 'username email profilePicture _id'
      }
    ];
    const currentUser = await Users.findById(req.params.id)

    if (!currentUser) {
      const error = new CustomError("User not found!", 404);
      throw error;
    }
    const userPosts = await Posts.find({ userId: currentUser._id }).populate(query)
    res.status(200).json(userPosts)
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
      const error = new CustomError("Post does not exist", 404);
      throw error;
    }
    const targetUser = await Users.findById(post.userId)
    if (!targetUser) {
      const error = new CustomError("User does not exist", 404);
      throw error;
    }
    if (req.userId) {
      const currentUser = await Users.findById(req.userId)
      if (!post.likes.includes(new Types.ObjectId(req.userId))) {
        await post.updateOne({ $push: { likes: new Types.ObjectId(req.userId) } })
        if (targetUser.id !== req.userId) {
          await targetUser.updateOne({
            $push: {
              notifications: {
                actions: `${currentUser?.username} liked your post`,
                actionUser: {
                  email: currentUser?.email,
                  username: currentUser?.username,
                  profilePicture: currentUser?.profilePicture,
                  userId: currentUser?.id
                },
                actionPostId: post.id,
                read: false,
                dateOfAction: new Date().toISOString()
              }
            }
          })
        }

        res.status(200).json("User liked post!")

      } else {
        await post.updateOne({ $pull: { likes: new Types.ObjectId(req.userId) } })
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
  const query = [
    {
      path: 'linkedUser',
      select: 'username email profilePicture _id'
    },
    {
      path: 'likes',
      select: 'username email profilePicture _id'
    }
  ];
  try {
    const post = await Posts.findById(req.params.id).populate(query)

    if (!post) {
      const error = new CustomError("Post not found!", 404);
      throw error
    }

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
    const currentUser = await Users.findById(req.params.id)

    if (!currentUser) {
      const error = new CustomError("User not found!", 404);
      throw error;
    }
    const query = [
      {
        path: 'linkedUser',
        select: 'username email profilePicture _id'
      },
      {
        path: 'likes',
        select: 'username email profilePicture _id'
      }
    ];
    const userPosts = await Posts.find({ userId: currentUser._id }).populate(query)

    const friendPosts = await Promise.all<any[]>(
      currentUser.following.map(friendId => { return Posts.find({ userId: friendId }).populate(query) })
    )

    res.status(200).json(userPosts.concat(...friendPosts))


  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const getPostsOnExplore = async (req: Request, res: Response, next: NextFunction) => {
  const query = [
    {
      path: 'linkedUser',
      select: 'username email profilePicture _id'
    },
    {
      path: 'likes',
      select: 'username email profilePicture _id'
    }
  ];
  try {
    const randomPosts = await Posts.aggregate([{ $sample: { size: 17 } }])
    const aggregatedPosts = await Posts.populate(randomPosts, query)

    res.status(200).json(aggregatedPosts)

  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const bookmarkPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Posts.findById(req.params.id)
    if (!post) {
      const error = new CustomError("Post not found!", 404);
      throw error;
    }
    const currentUser = await Users.findById(req.userId)
    if (!currentUser) {
      const error = new CustomError("User not found!", 404);
      throw error;
    }
    if (!currentUser.bookmarks.includes(post.id)) {
      await currentUser.updateOne({ $push: { bookmarks: post.id } })
      res.status(200).json("Added to bookmarks")
    } else {
      await currentUser.updateOne({ $pull: { bookmarks: post.id } })
      res.status(403).json("Removed from bookmarks")
    }

  }
  catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}

export const getAllBookmarks = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const user = await Users.findById(req.userId).populate("bookmarks")
    if (!user) {
      const error = new CustomError("User not found!", 404);
      throw error;
    }

    res.status(200).json(user["bookmarks"])

  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Posts.findById(req.params.id)
    if (!post) {
      throw new CustomError("Post not found", 404)
    }
    const currentUser = await Users.findById(req.userId)
    const postUser = await Users.findById(post.userId)
    if (!currentUser || !postUser) {
      throw new CustomError("User not found", 404)
    }
    await post?.updateOne({
      $push: {
        comments: {
          comment: req.body.comment,
          dateOfReply: new Date().toISOString(),
          commenter: {
            userId: currentUser.id,
            email: currentUser.email,
            profilePicture: currentUser.profilePicture,
            username: currentUser.username
          },
          likes: []

        }
      }
    })
    await postUser.updateOne({
      $push: {
        notifications: {
          actions: `${currentUser.username} replied your post`,
          actionUser: {
            email: currentUser?.email,
            username: currentUser?.username,
            profilePicture: currentUser?.profilePicture,
            userId: currentUser?.id
          },
          actionPostId: post.id,
          read: false,
          dateOfAction: new Date().toISOString()
        }
      }
    })
    res.status(200).json("You made a comment")
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const likeComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Posts.findById(req.params.id)
    if (!post) {
      throw new CustomError("Post not found", 404)
    }
    const currentUser = await Users.findById(req.userId)

    if (!req.userId || !currentUser) {
      throw new CustomError("User not found", 404)
    }
    const reply = post.comments.find(p => p._id?.toString() === req.body.replyId)
    if (!reply) {
      throw new CustomError("Reply not found", 404)
    }
    const indexOfReply = post.comments.findIndex(p => p._id?.toString() === req.body.replyId)


    if (!reply?.likes.includes(new Types.ObjectId(req.userId))) {
      const likesInReply = reply.likes.concat(new Types.ObjectId(req.userId))
      post.comments[indexOfReply].likes = likesInReply
      const updatedComments = [...post.comments]
      await post.updateOne({
        $set: {
          comments: updatedComments
        }
      })


      const targetUser = await Users.findById(reply.commenter.userId)
      if (targetUser?.id !== req.userId && targetUser) {
        await targetUser.updateOne({
          $push: {
            notifications: {
              actions: `${currentUser?.username} liked your comment`,
              actionUser: {
                userId: currentUser.id,
                email: currentUser.email,
                username: currentUser.username,
                profilePicture: currentUser.profilePicture
              },
              read: false,
              actionPostId: post.id,
              dateOfAction: new Date().toISOString()
            }
          }
        })
      }
      res.status(200).json("User liked comment!")
    }
    else {
      const likesInReply = reply.likes.filter(id => id !== new Types.ObjectId(req.userId!))
      post.comments[indexOfReply].likes = likesInReply
      const updatedComments = [...post.comments]

      await post.updateOne({
        $set: {
          comments: updatedComments
        }
      })
      res.status(403).json("Like removed from comment")
    }
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }


}

