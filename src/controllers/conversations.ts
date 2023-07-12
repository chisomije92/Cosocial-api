
import { Request, Response, NextFunction } from "express";
import Conversation from "../models/conversation.js";


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