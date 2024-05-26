import { Todo } from "../models/todo.model.js";
import { SubTodo } from "../models/subTodo.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { checkObjectId , validateObjectId} from "../utils/commonFunctions.js"
import { redisClient } from "../index.js";

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

    await redisClient.del(todoId);

    return res
    .status(200)
    .json(new ApiResponse(200, subTodo, "Successfully created SubTodo"))
})

const updatedSubTodo = asyncHandler( async (req, res) => {
    const { content } = req.body;
    const { todoId, subTodoId } = req.params;

    if (!content && !subTodoId) throw new ApiError(401, "Content and SubTodoId are required")
    if (!todoId) throw new ApiError(401, "Todo Id is required")

    checkObjectId(todoId);
    checkObjectId(subTodoId);

    const todo = await Todo.findById(todoId)

    if (!todo) throw new ApiError(404, "Todo not found")

    validateObjectId(todo, req)

    const subTodo = await SubTodo.findById(subTodoId)

    if (!subTodo) throw new ApiError(404, "subTodo not found")

    const udpateSubTodo = await SubTodo.findByIdAndUpdate(subTodoId,
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
    .json(new ApiResponse(200, udpateSubTodo, "Updated SubTodo successfully"))
})

const deleteSubTodo = asyncHandler( async(req, res) => {
    const { todoId, subTodoId } = req.params;

    if (!todoId && !subTodoId) throw new ApiError(401, "Todo And SubTodo Ids are required")

    checkObjectId(todoId);
    checkObjectId(subTodoId);

    const todo = await Todo.findById(todoId)

    if (!todo) throw new ApiError(404, "Todo not found")

    validateObjectId(todo, req)

    const subTodo = await SubTodo.findById(subTodoId)

    if (!subTodo) throw new ApiError(404, "subTodo not found")

    await SubTodo.findByIdAndDelete(subTodoId)

    await redisClient.del(todoId);

    return res
    .status(200)
    .json(new ApiResponse(200, {}, `Delete SubTodo Successfully. SubTodoId: ${subTodoId}`))
})

const completeAndUncompleteSubTodo = asyncHandler( async(req, res) => {
    const { todoId, subTodoId } = req.params;

    if (!todoId && !subTodoId) throw new ApiError(401, "Todo And SubTodo Ids are required")

    checkObjectId(todoId);
    checkObjectId(subTodoId);

    const todo = await Todo.findById(todoId)

    if (!todo) throw new ApiError(404, "Todo not found")

    validateObjectId(todo, req)

    const subTodo = await SubTodo.findById(subTodoId)

    if (!subTodo) throw new ApiError(404, "subTodo not found")

    const updatedSubTodo = await SubTodo.findByIdAndUpdate(
        subTodoId,
        {
            $set: {
                complete: subTodo.complete ? false : true
            }
        },
        {
            new: true
        }
    )

    await redisClient.del(todoId);

    return res
    .status(200)
    .json(new ApiResponse(200, {complete: updatedSubTodo.complete}, "Upadated Action successfully"))
})

export {createSubTodo, updatedSubTodo, deleteSubTodo, completeAndUncompleteSubTodo}