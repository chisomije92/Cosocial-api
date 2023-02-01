
import express, { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"
const helmet = require("helmet")
import morgan from "morgan"
import dotenv from "dotenv"
import userRoute from "./routes/users"
import authRoute from "./routes/auth"
import postRoute from "./routes/posts"
import cors from 'cors';

const app = express()

dotenv.config()

const { MONGO_URL } = process.env

mongoose.set("strictQuery", false);
if (MONGO_URL) {
  mongoose.connect(MONGO_URL)
    .then(() => console.log("Connected to Mongo db"))
}

app.use(cors<Request>())
app.use(express.json())
app.use(helmet())
app.use(morgan("common"))

app.use("/api/users", userRoute)

app.use("/api/auth", authRoute)

app.use('/api/posts', postRoute)

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});


app.listen(8000, () => {
  console.log("Server is running")
})