
export class CustomError extends Error {
  constructor(public message: string, private statusCode: number) {
    super(message)
  }
}