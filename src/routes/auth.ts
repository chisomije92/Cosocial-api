
/** @format */

import express from "express";
import { body } from "express-validator";
import { registerUser } from "./../controllers/auth";
import { loginUser } from "./../controllers/auth";

const router = express.Router();

router.post(
  "/sign-up",
  [
    body("username").trim().isLength({ min: 4 }),
    body("email").isEmail().normalizeEmail().isLength({ max: 50 }),
    body("password").isLength({ min: 6 }),
  ],
  registerUser

);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  loginUser
);

export default router;
