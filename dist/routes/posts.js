"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const posts_1 = require("./../controllers/posts");
const express_1 = __importDefault(require("express"));
const is_auth_1 = __importDefault(require("../middlewares/is-auth"));
const router = express_1.default.Router();
router.post('/', is_auth_1.default, posts_1.createPosts);
router.put("/:id", is_auth_1.default, posts_1.updatePost);
router.delete("/:id", is_auth_1.default, posts_1.deletePost);
router.get("/:id", is_auth_1.default, posts_1.getPost);
router.put("/:id/like", is_auth_1.default, posts_1.likePost);
router.get("/:id/timeline", is_auth_1.default, posts_1.getPostsOnTL);
exports.default = router;
//# sourceMappingURL=posts.js.map