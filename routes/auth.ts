import express from "express"
import User from "../models/user"
import bcrypt from "bcrypt"


const router = express.Router()

router.post("/sign-up", async (req, res) => {

  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    })
    await newUser.save().then((data) => res.status(200).json(data))

  } catch (error) {
    console.log(error)
  }

})

router.post("/login", async (req, res) => {

  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      res.status(404).json("User not found!")
    }
    const validPassword = await bcrypt.compare(req.body.password, user!.password)
    !validPassword && res.status(400).json("User credentials are incorrect!")
    res.status(200).json(user)
  } catch (err) {
    console.log(err)
  }

})



export default router