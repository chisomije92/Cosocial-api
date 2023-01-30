
import express from "express"
import { registerUser } from "../controllers/auth"
import { loginUser } from './../controllers/auth';

const router = express.Router()

router.post("/sign-up", registerUser)

router.post("/login", loginUser)



export default router