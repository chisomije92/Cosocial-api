"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const posts_1 = require("./../controllers/posts");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/', posts_1.createPosts);
router.put("/:id", posts_1.updatePost);
router.delete("/:id", posts_1.deletePost);
router.get("/:id", posts_1.getPost);
router.put("/:id/like", posts_1.likePost);
router.get("/:id/timeline", posts_1.getPostsOnTl);
exports.default = router;
//# sourceMappingURL=posts.js.map