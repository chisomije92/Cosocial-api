import { createPosts, deletePost, updatePost, likePost, getPost, getPostsOnTL } from './../controllers/posts';
import express from "express"
import isAuth from '../middlewares/is-auth';


const router = express.Router()


router.post('/', isAuth, createPosts)
router.put("/:id", isAuth, updatePost)
router.delete("/:id", isAuth, deletePost)
router.get("/:id", isAuth, getPost)
router.put("/:id/like", isAuth, likePost)
router.get("/:id/timeline", isAuth, getPostsOnTL)


export default router