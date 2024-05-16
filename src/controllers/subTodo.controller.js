import { Todo } from "../models/todo.model.js";
import { User } from "../models/user.model.js";
import { SubTodo } from "../models/subTodo.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { checkObjectId } from "../utils/commonFunctions.js"
import mongoose from "mongoose";

const createSubTodo = asyncHandler( async(req, res) => {
    const { content } = req.body;
    const { todoId } = req.params;
    
    if (!content) throw new ApiError(401, "Content is required")

    checkObjectId(todoId);
    
    if (!todoId) throw new ApiError(401, "Todo Id is required")

    const todo = await Todo.findById(todoId)

    if (!todo) throw new ApiError(401, "Todo Id is invalid")

    const subTodo = await SubTodo.create({
        content: content,
        createdBy: todoId
    })

    return res
    .status(200)
    .json(new ApiResponse(200, subTodo, "Successfully created SubTodo"))
})


export {createSubTodo}