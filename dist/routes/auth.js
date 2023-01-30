"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const auth_2 = require("./../controllers/auth");
const router = express_1.default.Router();
router.post("/sign-up", auth_1.registerUser);
router.post("/login", auth_2.loginUser);
exports.default = router;
//# sourceMappingURL=auth.js.map