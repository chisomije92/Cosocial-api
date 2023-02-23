import { createPosts, deletePost, updatePost, likePost, getPost, getPostsOnTL, bookmarkPost, getAllBookmarks } from './../controllers/posts';
import express from "express"
import isAuth from '../middlewares/is-auth';


const router = express.Router()


router.post('/', isAuth, createPosts)
router.get("/bookmark", isAuth, getAllBookmarks)
router.put("/:id", isAuth, updatePost)
router.delete("/:id", isAuth, deletePost)
router.get("/:id", isAuth, getPost)
router.put("/:id/like", isAuth, likePost)
router.get("/:id/timeline", isAuth, getPostsOnTL)
router.put("/:id/bookmark", isAuth, bookmarkPost)


export default router