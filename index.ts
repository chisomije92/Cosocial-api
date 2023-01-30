import express from "express"
import mongoose from "mongoose"
const helmet = require("helmet")
import morgan from "morgan"
import dotenv from "dotenv"
import userRoute from "./routes/users"
import authRoute from "./routes/auth"

const app = express()

dotenv.config()

const { MONGO_URL } = process.env

mongoose.set("strictQuery", true);
if (MONGO_URL) {
  mongoose.connect(MONGO_URL)
    .then(() => console.log("Connected to Mongo db"))
}

app.use(express.json())
app.use(helmet())
app.use(morgan("common"))

app.use("/api/users", userRoute)

app.use("/api/auth", authRoute)


app.listen(8000, () => {
  console.log("Server is running")
})