import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";

const registerUser = asyncHandler( async (req, res) => {
    const {userName, email, password} = req.body;

    const mandatoryparams = {
        userName: userName,
        email: email,
        password: password
    }
    for (let key in mandatoryparams) {
        if (mandatoryparams[key]?.trim() == "") {
            throw new ApiError(400, `${key} field is required`);
        }
    }

    const existedUser = await User.findOne({
        $or: [{userName}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    const user = await User.create({
        userName: userName.toLowerCase(),
        email: email.toLowerCase(),
        password: password,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, 'Something went wrong while registering user')
    }

    return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered successfully"))
    
})

export { registerUser }