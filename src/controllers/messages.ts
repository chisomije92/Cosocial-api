
import { Request, Response, NextFunction } from "express";
import Message from "../models/message.js";
import Conversation from "../models/conversation.js";



export const createMessage = async (req: Request, res: Response, next: NextFunction) => {


  try {
    //const newMessage = new Message(req.body)
    //const savedMessage = await newMessage.save()

    //res.status(200).json(savedMessage)

    const foundConversation = await Conversation.find({
      members: {
        $in: [req.body.senderId, req.body.receiverId]
      }
    })

    if (!foundConversation) {

    }
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

export const chatWithUser = async (req: Request, res: Response, next: NextFunction) => {


  try {
    let conversation: any
    const foundConversation = await Conversation.findOne({
      members: {
        $in: [req.body.senderId, req.body.receiverId]
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
    }
    res.status(200).json(conversation)
  } catch (err: any) {

    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }

}