import { createSubTodo, updatedSubTodo, deleteSubTodo, completeAndUncompleteSubTodo } from "../controllers/subTodo.controller.js";
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:todoId")
.post(verifyJwt, createSubTodo)

router.route("/:todoId/:subTodoId")
.patch(verifyJwt, updatedSubTodo)
.delete(verifyJwt, deleteSubTodo)

router.route("/:todoId/:subTodoId/completeAndUncompleteSubTodo").patch(verifyJwt, completeAndUncompleteSubTodo);

export default router;