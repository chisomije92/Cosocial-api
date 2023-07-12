
import { Request, Response, NextFunction } from "express";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";


export const createMessage = async (req: Request, res: Response, next: NextFunction) => {


  try {
    const newMessage = new Message(req.body)
    const savedMessage = await newMessage.save()

    res.status(200).json(savedMessage)
  } catch (err: any) {

    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}

export const getMessage = async (req: Request, res: Response, next: NextFunction) => {


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