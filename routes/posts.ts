import { createPosts, deletePost, updatePost } from './../controllers/posts';
import express from "express"


const router = express.Router()


router.post('/', createPosts)
router.put("/:id", updatePost)
router.delete("/:id", deletePost)


export default router