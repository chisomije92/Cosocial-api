
import { Request, Response, NextFunction } from "express";
import Conversation from "../models/conversation.js";
import Users, { UserType } from "../models/user.js";
import { CustomError } from "../error-model/custom-error.js";


export const createConversation = async (req: Request, res: Response, next: NextFunction) => {


  try {
    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId]
    })
    const savedConversation = await newConversation.save()

    res.status(200).json(savedConversation)
  } catch (err: any) {

    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const getConversation = async (req: Request, res: Response, next: NextFunction) => {


  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] }
    })

    res.status(200).json(conversation)
  } catch (err: any) {

    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}


export const chatWithUser = async (req: Request, res: Response, next: NextFunction) => {


  try {
    let conversation: any
    const foundConversation = await Conversation.findOne({
      members: {
        $all: [req.body.senderId, req.body.receiverId]
      }
    })

    if (!foundConversation) {
      conversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId],
        messages: [{
          senderId: req.body.senderId,
          receiverId: req.body.receiverId,
          text: req.body.text,
          dateOfAction: new Date().toISOString()
        }]
      })

      await conversation.save()

      console.log("not found")
    } else {
      let updatedMessages = foundConversation.messages.concat({
        senderId: req.body.senderId,
        receiverId: req.body.receiverId,
        text: req.body.text,
        dateOfAction: new Date().toISOString()
      })

      await foundConversation.updateOne({
        messages: updatedMessages
      })
      console.log("found")
    }
    res.status(200).json(conversation)
  } catch (err: any) {

    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}


export const getChatUsers = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const currentUser = await Users.findById(req.params.userId)
    if (!currentUser) {
      const error = new CustomError("User not found!", 404);
      throw error;
    }
    const foundConversations = await Conversation.find({
      members: {
        $in: [req.params.userId]
      }
    })

    if (foundConversations) {
      const chatUsersIds = foundConversations.map(v => {
        return v.members
          .filter((id: any) => id !== req.params.userId)
          .reduce((v: string) => v);
      })

      const chats = foundConversations.map(v => {
        return v.messages.slice(-1).reduce(m => {
          return {
            id: m._id?.toString(),
            text: m.text,
            senderId: m.senderId,
            receiverId: m.receiverId,
            dateOfAction: m.dateOfAction,
          }
        })

      })

      const chatUsers = await Promise.all<any[]>(
        chatUsersIds.map(async (id: string) => {
          const user = await Users.findById(id);

          return {
            _id: user?._id.toString(),
            username: user?.username,
            email: user?.email,
            profilePicture: user?.profilePicture,
            recentMessage: chats.find(c => user!.id === c.senderId || user!.id === c.receiverId)?.text,
            recentDate: chats.find(c => user!.id === c.senderId || user!.id === c.receiverId)?.dateOfAction
          }
        })
      );

      res.status(200).json(chatUsers);
    } else {
      res.status(200).json([]);
    }


  } catch (err: any) {

    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}