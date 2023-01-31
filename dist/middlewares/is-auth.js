"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const custom_error_1 = require("./../error-model/custom-error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let secret;
if (process.env.JWT_SECRET) {
    secret = process.env.JWT_SECRET;
}
else {
    throw new Error("JWT_SECRET is not set");
}
exports.default = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        const error = new custom_error_1.CustomError("Not authenticated", 401);
        throw error;
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, secret);
    }
    catch (err) {
        err.statusCode = 500;
        next(err);
    }
    if (!decodedToken) {
        const error = new Error("Not authenticated");
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
};
//# sourceMappingURL=is-auth.js.map