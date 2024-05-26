import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { redisClient } from '../index.js';

export const cacheData = asyncHandler( async(req, res, next) => {
    const todoId = req.params.todoId;
    let result;
    try {
        const cacheResult = await redisClient.get(todoId)
        if (cacheResult) {
            result = JSON.parse(cacheResult)
            return res
            .status(200)
            .json(new ApiResponse(200,
                {
                    fromCache: true,
                    result: result
                },
                "Todo data fetched successfully"
            ))
        }
        else next()
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching Todo cache data. Error: " + error)
    }
})