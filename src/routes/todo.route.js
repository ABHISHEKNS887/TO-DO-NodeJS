import { createTodo, getTodo, updateTodo, deleteTodoById, completeAndUncompleteTodo } from "../controllers/todo.controller.js";
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/createTodo").post(verifyJwt, createTodo);

router.route("/:todoId").get(verifyJwt, getTodo);

router.route("/:todoId/updateTodo").patch(verifyJwt, updateTodo);

router.route("/:todoId/deleteTodo").delete(verifyJwt, deleteTodoById);

router.route("/:todoId/completeAndUncompleteTodo").patch(verifyJwt, completeAndUncompleteTodo)

export default router;
