
import { resolve } from 'path';

import { CustomError } from './../error-model/custom-error.js';
import Posts, { PostType, Reply } from "../models/posts.js";
import { Request, Response, NextFunction } from "express";
import Users, { UserType } from "../models/user.js";
import { clearImage } from '../utils/utils.js';
import { Document, Types } from 'mongoose';
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
    getIO().emit("posts", {
      action: "getUserPosts",
      posts: userPosts
    })
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

    let updatedLikes: Types.ObjectId[]
    let updatedPost: (Document<unknown, {}, PostType> & Omit<PostType & Required<{
      _id: Types.ObjectId;
    }>, never>) | null
    let postLikes: any[]
    if (req.userId) {
      const currentUser = await Users.findById(req.userId)
      if (!post.likes.includes(new Types.ObjectId(req.userId))) {
        updatedLikes = post.likes.concat(new Types.ObjectId(req.userId))
        updatedPost = await Posts.findOneAndUpdate({ _id: req.params.id }, { likes: updatedLikes }, {
          new: true
        })
        if (!updatePost) {
          throw new CustomError("Operation failed", 500)
        }

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
        postLikes = await Promise.all<any[]>(
          updatedLikes.map(async (like) => {
            const user = await Users.findById(like)
            return ({
              username: user?.username,
              email: user?.email,
              profilePicture: user?.profilePicture,
              _id: user?._id
            })
          }
          )
        )

        res.status(200).json("User liked post!")


      } else {
        updatedLikes = post.likes.filter(id => id.toString() !== req.userId)
        updatedPost = await Posts.findOneAndUpdate({ _id: req.params.id }, { likes: updatedLikes }, {
          new: true
        })
        postLikes = await Promise.all<any[]>(
          updatedLikes.map(async (like) => {
            const user = await Users.findById(like)
            return ({
              username: user?.username,
              email: user?.email,
              profilePicture: user?.profilePicture,
              _id: user?._id
            })
          }
          )
        )
        res.status(403).json("Like removed from post")
      }
      getIO().emit("posts", {
        action: "like",
        post: {
          ...post.toObject(),
          linkedUser: {
            username: currentUser?.username,
            email: currentUser?.email,
            profilePicture: currentUser?.profilePicture,
            _id: currentUser?._id
          },
          likes: postLikes
        }
      })
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
    },
    {
      path: "comments",
      populate: [{
        path: "likes",
        select: 'username email profilePicture _id'
      }]

    }
  ];
  try {
    const post = await Posts.findById(req.params.id).populate(query)

    if (!post) {
      const error = new CustomError("Post not found!", 404);
      throw error
    }
    getIO().emit("posts", {
      action: "getPost",
      post: {
        ...post.toObject(),
      }
    })
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

    getIO().emit("posts", {
      action: "getPostsOnTL",
      posts: userPosts.concat(...friendPosts)
    })

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
    getIO().emit("posts", {
      action: "getPostsOnExplore",
      posts: aggregatedPosts
    })
    res.status(200).json(aggregatedPosts)

  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const bookmarkPost = async (req: Request, res: Response, next: NextFunction) => {
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
      throw error;
    }
    const currentUser = await Users.findById(req.userId)
    if (!currentUser) {
      const error = new CustomError("User not found!", 404);
      throw error;
    }
    let updatedBookmarks: Types.ObjectId[]
    let updatedCurrentUser: (Document<unknown, {}, UserType> & Omit<UserType & Required<{
      _id: Types.ObjectId;
    }>, never>) | null
    let bookmarkedPosts: any[]
    if (!currentUser.bookmarks.includes(post.id)) {
      updatedBookmarks = [post._id,
      ...currentUser.bookmarks]
      updatedCurrentUser = await Users.findOneAndUpdate({ _id: currentUser._id }, { bookmarks: updatedBookmarks }, { new: true }).populate("bookmarks")
      bookmarkedPosts = await Promise.all<any[]>(
        updatedCurrentUser!.bookmarks.map(async (v) => {
          const post = await Posts.findById(v).populate(query)
          return post
        }
        ))
      res.status(200).json("Added to bookmarks")
    } else {
      updatedBookmarks = currentUser.bookmarks.filter(b => b.toString() !== post._id.toString())
      updatedCurrentUser = await Users.findOneAndUpdate({ _id: currentUser._id }, { bookmarks: updatedBookmarks }, { new: true }).populate("bookmarks")
      bookmarkedPosts = await Promise.all<any[]>(
        updatedCurrentUser!.bookmarks.map(async (v) => {
          const post = await Posts.findById(v).populate(query)
          return post
        }
        )
      )
      res.status(403).json("Removed from bookmarks")
    }
    getIO().emit("posts", {
      action: "bookmark",
      user: {
        ...updatedCurrentUser?.toObject(),
        bookmarks: bookmarkedPosts
      }
    })
  }
  catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}

export const getAllBookmarks = async (req: Request, res: Response, next: NextFunction) => {
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
    const user = await Users.findById(req.userId).populate("bookmarks")
    if (!user) {
      const error = new CustomError("User not found!", 404);
      throw error;
    }
    const bookmarkedPosts = await Promise.all<any[]>(
      user.bookmarks.map(async (v) => {
        const post = await Posts.findById(v).populate(query)
        return post
      }
      )
    )

    res.status(200).json(bookmarkedPosts)

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

    const newComment = {
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

    post.comments.unshift(newComment)
    const updatedComments = [...post.comments]
    const updatedPost = await Posts.findOneAndUpdate({ _id: req.params.id }, { comments: updatedComments }, {
      new: true
    })

    if (newComment.commenter.userId !== req.userId) {
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
    }

    res.status(200).json("You made a comment")
    getIO().emit("posts", {
      action: "comment",
      comments: updatedPost?.comments
    })
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Posts.findById(req.params.id)
    if (!post) {
      throw new CustomError("Post not found", 404)
    }
    const user = await Users.findById(req.userId)
    if (!user) {
      throw new CustomError("User not found", 404)
    }
    const userCommentIndex = post.comments.findIndex(c => c.commenter.userId === req.userId)
    if (userCommentIndex >= 0) {
      const updatedComments = post.comments.filter(v => v._id?.toString() !== req.body.replyId)
      const updatedPost = await Posts.findOneAndUpdate({ _id: req.params.id }, { comments: updatedComments }, {
        new: true
      })
      res.status(200).json("Comment deleted!")
    } else {
      throw new CustomError("User not authorized", 403)
    }


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

    let likesInReply: Types.ObjectId[]
    let updatedComments: Reply[]
    let mappedLikes: any[]

    if (!reply?.likes.includes(new Types.ObjectId(req.userId))) {
      likesInReply = reply.likes.concat(new Types.ObjectId(req.userId))
      post.comments[indexOfReply].likes = likesInReply
      updatedComments = [...post.comments]
      mappedLikes = await Promise.all<any[]>(
        likesInReply.map(async (like) => {
          const user = await Users.findById(like)
          return ({
            username: user?.username,
            email: user?.email,
            profilePicture: user?.profilePicture,
            _id: user?._id
          })
        }
        )
      )
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
      likesInReply = reply.likes.filter(id => id.toString() !== req.userId)
      post.comments[indexOfReply].likes = likesInReply
      updatedComments = [...post.comments]
      mappedLikes = await Promise.all<any[]>(
        likesInReply.map(async (like) => {
          const user = await Users.findById(like)
          return ({
            username: user?.username,
            email: user?.email,
            profilePicture: user?.profilePicture,
            _id: user?._id
          })
        }
        )
      )
      await post.updateOne({
        $set: {
          comments: updatedComments
        }
      })
      res.status(403).json("Like removed from comment")
    }
    getIO().emit("posts", {
      action: "likeReply",
      reply: {
        _id: reply._id,
        comment: reply.comment,
        commenter: { ...reply.commenter },
        dateOfReply: reply.dateOfReply,
        likes: mappedLikes
      }
    })
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }


}

