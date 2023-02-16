"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const custom_error_1 = require("../error-model/custom-error");
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validation_result_1 = require("express-validator/src/validation-result");
const jsonwebtoken_1 = require("jsonwebtoken");
dotenv_1.default.config();
const { JWT_SECRET } = process.env;
let secret;
if (JWT_SECRET) {
    secret = JWT_SECRET;
}
else {
    throw new Error("JWT_SECRET is not set");
}
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validationErrors = (0, validation_result_1.validationResult)(req);
    if (!validationErrors.isEmpty()) {
        const error = new custom_error_1.CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
        return res.status(error.statusCode).json({ message: error.message, errors: error.errors });
    }
    const { email, password, username } = req.body;
    try {
        const existingEmail = yield user_1.default.findOne({ email: email });
        if (existingEmail) {
            const error = new custom_error_1.CustomError("User exists already!", 409);
            throw error;
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        const newUser = new user_1.default({
            username: username,
            email: email,
            password: hashedPassword
        });
        const savedUser = yield newUser.save();
        const token = (0, jsonwebtoken_1.sign)({
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
exports.registerUser = registerUser;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const validationErrors = (0, validation_result_1.validationResult)(req);
    if (!validationErrors.isEmpty()) {
        const error = new custom_error_1.CustomError("Validation failed, entered data is incorrect", 422, validationErrors.array());
        return res.status(error.statusCode).json({ message: error.message, errors: error.errors });
    }
    try {
        const user = yield user_1.default.findOne({ email: email });
        if (!user) {
            const error = new custom_error_1.CustomError("User not found!", 404);
            throw error;
        }
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            const error = new custom_error_1.CustomError("User credentials are invalid!", 400);
            throw error;
        }
        const token = (0, jsonwebtoken_1.sign)({
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
exports.loginUser = loginUser;
//# sourceMappingURL=auth.js.map