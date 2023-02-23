"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("./../controllers/auth");
const auth_2 = require("./../controllers/auth");
const router = express_1.default.Router();
router.post("/sign-up", [
    (0, express_validator_1.body)("username").trim().isLength({ min: 4 }),
    (0, express_validator_1.body)("email").isEmail().normalizeEmail().isLength({ max: 50 }),
    (0, express_validator_1.body)("password").isLength({ min: 6 }),
], auth_1.registerUser);
router.post("/login", [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.body)("password").isLength({ min: 6 }),
], auth_2.loginUser);
exports.default = router;
//# sourceMappingURL=auth.js.map