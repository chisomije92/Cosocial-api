var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from 'dotenv';
import { CustomError } from '../error-model/custom-error.js';
import User from "../models/user.js";
import bcrypt from "bcrypt";
import { validationResult } from 'express-validator/src/validation-result.js';
import jsonwebtoken from "jsonwebtoken";
const { sign } = jsonwebtoken;
dotenv.config();
const { JWT_SECRET } = process.env;
let secret;
if (JWT_SECRET) {
    secret = JWT_SECRET;
}
else {
    throw new Error("JWT_SECRET is not set");
}
export const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const error = new CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
        return res.status(error.statusCode).json({ message: error.message, errors: error.errors });
    }
    const { email, password, username } = req.body;
    try {
        const existingEmail = yield User.findOne({ email: email });
        if (existingEmail) {
            const error = new CustomError("User exists already", 409);
            throw error;
        }
        const salt = yield bcrypt.genSalt(10);
        const hashedPassword = yield bcrypt.hash(password, salt);
        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
        });
        const savedUser = yield newUser.save();
        const token = sign({
            email: savedUser.email,
            userId: savedUser._id.toString()
        }, secret, { expiresIn: '1h' });
        res.status(200).json({ token, userId: savedUser._id.toString() });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
export const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const error = new CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
        return res.status(error.statusCode).json({ message: error.message, errors: error.errors });
    }
    try {
        const user = yield User.findOne({ email: email });
        if (!user) {
            const error = new CustomError("User does not exist", 404);
            throw error;
        }
        const validPassword = yield bcrypt.compare(password, user.password);
        if (!validPassword) {
            const error = new CustomError("Credentials are invalid!", 400);
            throw error;
        }
        const token = sign({
            email: user.email,
            userId: user._id.toString()
        }, secret, { expiresIn: '1h' });
        res.status(200).json({ token, userId: user._id.toString() });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
//# sourceMappingURL=auth.js.map