import mongoose from "mongoose";
import { ApiError } from "./apiError.js";

const checkObjectId = (objectId) => {
    if (mongoose.isValidObjectId(objectId)) {
    return true
} else {
  throw new ApiError(401, `Invalid ObjectId Id: ${objectId}`);
}
}

const validateObjectId = (data, req) => {
    if (data.createdBy !== req.user.email) throw new ApiError(401, "Invalid content id")
}

export {checkObjectId, validateObjectId}