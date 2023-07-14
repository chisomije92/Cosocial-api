
import express, { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import userRoute from "./routes/users.js"
import authRoute from "./routes/auth.js"
import postRoute from "./routes/posts.js"
import conversationRoute from "./routes/conversation.js"
import cors from 'cors';
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path"
import { createServer } from "http"
import { Server, Socket } from "socket.io";
import { init } from "./socket/index.js"

const app = express()
const httpServer = createServer(app)
const io = init(httpServer);


const __dirname = path.resolve();

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
app.use(helmet({
  crossOriginEmbedderPolicy: false,

}))
app.use(morgan("common"))


app.get("/", (req, res) => {
  res.send("COSOCIAL API")
})
app.use("/api/users", userRoute)

app.use("/api/auth", authRoute)

app.use('/api/posts', postRoute)

app.use('/api/conversations', conversationRoute)


app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});




if (MONGO_URL) {
  mongoose.connect(MONGO_URL)
    .then(() => console.log("Connected to Mongo db")).then(() => {
      httpServer.listen(8000);
      io.on("connection", (socket: Socket) => {
        console.log("New client connected");
      });
    }

    )
}