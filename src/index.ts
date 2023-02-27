
import express, { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"
const helmet = require("helmet")
import morgan from "morgan"
import dotenv from "dotenv"
import userRoute from "./routes/users"
import authRoute from "./routes/auth"
import postRoute from "./routes/posts"
import cors from 'cors';
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path"

const app = express()

dotenv.config()

const { MONGO_URL } = process.env

mongoose.set("strictQuery", false);
if (MONGO_URL) {
  mongoose.connect(MONGO_URL)
    .then(() => console.log("Connected to Mongo db"))
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


app.use(cors<Request>())
app.use(express.json())
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("image")
);
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