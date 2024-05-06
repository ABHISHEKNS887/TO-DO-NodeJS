import { Todo } from "../models/todo.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import mongoose, {isValidObjectId} from "mongoose";

const createTodo = asyncHandler( async(req, res) => {
    const {content} = req.body;

    if (!content) throw new ApiError(401, "Content is required")

    const user = await User.findById(req.user._id);

    if (!user) throw new ApiError(401, "User not found")

    const todo = await Todo.create({
        "content": content,
        createdBy: user.email
    })

    const createdTodo = await Todo.findById(todo._id)

    if (!createdTodo) throw new ApiError(500, "Something went wrong while creating todo")

    return res
    .status(200)
    .json(new ApiResponse(200, createdTodo, "Todo created successfully"))
    
})

const checkObjectId = (objectId) => {
    if (mongoose.isValidObjectId(objectId)) {
    return true
} else {
  throw new ApiError(401, `Invalid ObjectId Id: ${objectId}`);
}
}

const getTodo = asyncHandler( async (req, res) => {
    const {todoId} = req.params

    if (!todoId) throw new ApiError(401, "Todo Id not provided")
    
    checkObjectId(todoId)

    const todo = await Todo.findById(todoId)

    if (!todo) throw new ApiError(401, "Invalid Todo Id")

    return res
    .status(200)
    .json(new ApiResponse(200, todo, "Todo fetched successfully"))
})

export { createTodo, getTodo }