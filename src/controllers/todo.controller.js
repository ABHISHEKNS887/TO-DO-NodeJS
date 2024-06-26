import { Todo } from "../models/todo.model.js";
import { User } from "../models/user.model.js";
import { SubTodo } from "../models/subTodo.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { checkObjectId, validateObjectId } from "../utils/commonFunctions.js"
import mongoose from "mongoose";
import { redisClient } from "../index.js";

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

const getTodo = asyncHandler( async (req, res) => {
    const {todoId} = req.params

    if (!todoId) throw new ApiError(401, "Todo Id not provided")
    
    checkObjectId(todoId)

    const todo = await Todo.aggregate([
        {
            $match: {
                _id : new mongoose.Types.ObjectId(todoId)
            }
        },
        {
            $lookup: {
                from: "subtodos",
                localField: "_id",
                foreignField: "createdBy",
                as: "subTodos"
            }
        }
    ])

    validateObjectId(todo?.[0], req)

    if (!todo?.length) throw new ApiError(404, "Todo not found")

    await redisClient.set(todoId, JSON.stringify(todo[0]), {
      EX: 180,
      NX: true,
    });

    return res
    .status(200)
    .json(new ApiResponse(200, {
        fromCache: false,
        result: todo[0]
    }, "Todo fetched successfully"))
})

const updateTodo = asyncHandler( async(req, res) => {
    const {todoId} = req.params;
    const {content} = req.body;

    checkObjectId(todoId)
    
    const contentData = await Todo.findById(todoId)

    if (!contentData) throw new ApiError(401, "Invalid content id")
    
    validateObjectId(contentData, req)

    if (content?.trim() == "") throw new ApiError(401, "Content is required")
    
    const updateContent = await Todo.findByIdAndUpdate(
        todoId,
        {
            $set: {content: content}
        },
        {
            new: true
        }
    )
    await redisClient.del(todoId);

    return res
    .status(200)
    .json(new ApiResponse(200, updateContent, "Content updated successfully"))

})

const deleteTodoById = asyncHandler( async(req, res) => {
    const {todoId} = req.params;

    if (!todoId) throw new ApiError(401, "TodoId is required")

    checkObjectId(todoId)

    const contentData = await Todo.findById(todoId)

    if (!contentData) throw new ApiError(401, "Invalid content id")
    
    validateObjectId(contentData, req)

    // Deleting all SubTodos
    await SubTodo.deleteMany({
        createdBy: todoId
    })

    // Deleting the Todo
    await Todo.findByIdAndDelete(todoId)

    await redisClient.del(todoId);

    return res
    .status(200)
    .json(new ApiResponse(200, {}, `Deleted Todo successfully. TodoId: ${todoId}`))

})

const completeAndUncompleteTodo = asyncHandler( async(req, res) => {
    const {todoId} = req.params;

    if (!todoId) throw new ApiError(401, "TodoId is required")

    checkObjectId(todoId)

    const todoData = await Todo.findById(todoId)

    if (!todoData) throw new ApiError(401, "Invalid content id")
    
    validateObjectId(todoData, req)
        
    const updatedTodo = await Todo.findByIdAndUpdate(
        todoId,
        {
            $set: {
                complete: todoData.complete ? false : true
            }
        },
        {
            new: true
        }
    )

    await redisClient.del(todoId);

    return res
    .status(200)
    .json(new ApiResponse(200, {complete: updatedTodo.complete}, "Upadated Action successfully"))
})

export { createTodo, getTodo, updateTodo, deleteTodoById, completeAndUncompleteTodo }