import express from "express"
import mongoose from "mongoose"
const helmet = import("helmet")
import morgan from "morgan"
import dotenv from "dotenv"

const app = express()

dotenv.config()


app.listen(8000, () => {
  console.log("Server is running")
})