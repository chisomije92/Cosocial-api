import { createPosts, deletePost, updatePost, likePost, getPost, getPostsOnTL, bookmarkPost, getAllBookmarks, createComment, likeComment, getPostsOnExplore } from './../controllers/posts.js';
import express from "express";
import isAuth from '../middlewares/is-auth.js';
const router = express.Router();
router.post('/', isAuth, createPosts);
router.get("/bookmark", isAuth, getAllBookmarks);
router.get("/explore", isAuth, getPostsOnExplore);
router.put("/:id", isAuth, updatePost);
router.delete("/:id", isAuth, deletePost);
router.get("/:id", isAuth, getPost);
router.put("/:id/like", isAuth, likePost);
router.get("/:id/timeline", isAuth, getPostsOnTL);
router.put("/:id/bookmark", isAuth, bookmarkPost);
router.put("/:id/reply", isAuth, createComment);
router.put("/:id/reply/like", isAuth, likeComment);
export default router;
//# sourceMappingURL=posts.js.map