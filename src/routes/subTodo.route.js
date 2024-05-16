import { createSubTodo } from "../controllers/subTodo.controller.js";
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:todoId/createSubTodo").post(verifyJwt, createSubTodo);

export default router;