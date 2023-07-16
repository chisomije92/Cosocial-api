import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import userRoute from "./routes/users.js";
import authRoute from "./routes/auth.js";
import postRoute from "./routes/posts.js";
import conversationRoute from "./routes/conversation.js";
import cors from 'cors';
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";
import { createServer } from "http";
import { init } from "./socket/index.js";
const app = express();
const httpServer = createServer(app);
const io = init(httpServer);
const __dirname = path.resolve();
export const usersSocketMap = new Map();
dotenv.config();
const { MONGO_URL } = process.env;
mongoose.set("strictQuery", false);
if (MONGO_URL) {
    mongoose.connect(MONGO_URL)
        .then(() => console.log("Connected to Mongo db"));
}
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + "-" + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg") {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter,
}).single("image"));
app.use(helmet({
    crossOriginEmbedderPolicy: false,
}));
app.use(morgan("common"));
io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
        usersSocketMap.set(userId, socket.id);
    }
    else {
        usersSocketMap.delete(userId);
    }
    //console.log(userId)
    //console.log(usersSocketMap)
    next();
});
app.get("/", (req, res) => {
    res.send("COSOCIAL API");
});
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use('/api/posts', postRoute);
app.use('/api/conversations', conversationRoute);
//io.engine.use((req: any, res, next) => {
//  // do something
//  console.log(req.userId)
//  next();
//});
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
});
if (MONGO_URL) {
    let users = [];
    const addUser = (userId, socketId) => {
        const foundUser = users.find(user => user.userId !== userId);
        if (!foundUser) {
            users.push({ userId, socketId });
        }
        //users.push({ userId, socketId })
    };
    const getUser = (userId) => {
        return users.find(user => user.userId === userId);
    };
    const removeUser = (socketId) => {
        users = users.filter(user => user.socketId !== socketId);
        console.log(users);
    };
    mongoose.connect(MONGO_URL)
        .then(() => console.log("Connected to Mongo db")).then(() => {
        httpServer.listen(8000);
        io.on("connection", (socket) => {
            console.log("New client connected" + socket.id);
            console.log(usersSocketMap);
            //usersSocketMap.set()
            //socket.on("addUser", userId => {
            //  addUser(userId, socket.id);
            //  io.emit("getUsers", users)
            //  console.log(users)
            //})
            //socket.on("usersAdd", (data) => {
            //  console.log(data)
            //  if (data !== null) {
            //    usersSocketMap.set(data, socket.id)
            //  } else {
            //    usersSocketMap.delete(data)
            //  }
            //  //console.log(usersSocketMap.get("640f90d46a45339d2c15fd88"))
            //  //console.log(usersSocketMap)
            //  socket.emit("getUsers", usersSocketMap.get(socket.id))
            //})
            socket.on("join_room", (data) => {
                socket.join(data);
                console.log(`User with ID: ${socket.id} joined room: ${data}`);
            });
            socket.on("removeUser", (data) => {
                usersSocketMap.delete(data);
            });
            //socket.on("sendMessage", (data) => {
            //  //console.log(data)
            //  socket.join(usersSocketMap.get(data.receiverId));
            //  console.log(usersSocketMap)
            //  console.log(data)
            //  //socket.to(usersSocketMap.get(data.receiverId)).emit("receiveMessage", {
            //  //  receiverId: data.receiverId,
            //  //  senderId: data.senderId,
            //  //  text: data.text,
            //  //  dateOfAction: new Date().toISOString()
            //  //});
            //  io.to(data.room).emit("receiveMessage", {
            //    receiverId: data.receiverId,
            //    senderId: data.senderId,
            //    text: data.text,
            //    dateOfAction: new Date().toISOString(),
            //    room: data.room
            //  });
            //})
            socket.on('disconnect', () => {
                console.log('user disconnected');
                //removeUser(socket.id);
            });
        });
    });
}
//# sourceMappingURL=index.js.map