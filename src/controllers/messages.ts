
import { Request, Response, NextFunction } from "express";
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
    const message = await Message.find({
      conversationId: req.params.conversationId
    })

    res.status(200).json(message)
  } catch (err: any) {

    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}