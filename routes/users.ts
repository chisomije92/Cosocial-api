import { deleteUser, updateUser, getUser } from './../controllers/users';
import express from "express"


const router = express.Router()

router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.get("/:id", getUser)


export default router