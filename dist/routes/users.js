"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const is_auth_1 = __importDefault(require("../middlewares/is-auth"));
const express_validator_1 = require("express-validator");
const users_1 = require("./../controllers/users");
const router = express_1.default.Router();
router.put("/update-password", is_auth_1.default, [
    (0, express_validator_1.body)("oldPassword").isLength({ min: 6 }),
    (0, express_validator_1.body)("newPassword").isLength({ min: 6 }),
], users_1.changePassword);
router.put('/:id', is_auth_1.default, [
    (0, express_validator_1.body)("email")
        .optional()
        .isEmail(),
    (0, express_validator_1.body)("username").trim().isLength({ min: 4 })
        .optional({ nullable: true, checkFalsy: true }),
    (0, express_validator_1.body)("password").isLength({ min: 6 })
        .optional({ nullable: true, checkFalsy: true }),
], users_1.updateUser);
router.delete('/:id', is_auth_1.default, users_1.deleteUser);
router.get("/:id", is_auth_1.default, users_1.getUser);
router.put("/:id/follow", is_auth_1.default, users_1.followUser);
router.put("/:id/unfollow", is_auth_1.default, users_1.unFollowUser);
exports.default = router;
//# sourceMappingURL=users.js.map