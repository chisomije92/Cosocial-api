import { ValidationError } from "express-validator";

export class CustomError extends Error {
  constructor(public message: string, public statusCode: number, public errors?: ValidationError[] | string,) {
    super(message)
  }
}