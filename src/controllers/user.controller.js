import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";

const OPTIONS = {
    httpOnly: true,
    secure: true
}
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
}

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

const loginUser = asyncHandler( async (req, res) => {
    const {email, password } = req.body;

    const mandatoryparams = {
        email: email,
        password: password
    }
    for (let key in mandatoryparams) {
        if (mandatoryparams[key].trim() === '') {
            throw new ApiError(400, `${key} is required`);
        }
    }

    const existedUser = await User.findOne({email})

    if (!existedUser) {
        throw new ApiError(401, `User does not exist`);
    }

    const isPasswordValid = await existedUser.isPasswordCorrect(password);

    if (!isPasswordValid) throw new ApiError(401, `Incorrect Password`)

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id);

    const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken");

    return res
    .status(200)
    .cookie("accessToken", accessToken, OPTIONS)
    .cookie("refreshToken", refreshToken, OPTIONS)
    .json(new ApiResponse(200,
        {user: loggedInUser, accessToken, refreshToken},
        "User LoggedIn Successfully"
    ))

})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {refreshToken: 1} // This will remove the filed from the document.
        },
        {
            new: true // This will return the data after update.
        }

    )

    return res.
    status(200)
    .clearCookie("accessToken", OPTIONS)
    .clearCookie("refreshToken", OPTIONS)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const getCurrentUser = asyncHandler( async (req, res) => {
    return res.
    status(200)
    .json(new ApiResponse(200, req.user, "User data fetched successfully"))
})

export { registerUser, loginUser, logoutUser, getCurrentUser}