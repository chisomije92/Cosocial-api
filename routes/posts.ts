import { createPosts, deletePost, updatePost, likePost, getPost, getPostsOnTL } from './../controllers/posts';
import express from "express"


const router = express.Router()


router.post('/', createPosts)
router.put("/:id", updatePost)
router.delete("/:id", deletePost)
router.get("/:id", getPost)
router.put("/:id/like", likePost)
router.get("/:id/timeline", getPostsOnTL)


export default router