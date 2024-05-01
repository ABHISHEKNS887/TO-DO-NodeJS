import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trime: true,
        index: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trime: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        min: [6, "Minimum 6 characters are required, got "+ VALUE]
    }
})

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return  next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCheck = async function() {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign({
        _id: this._id,
        userName: this.userName,
        email: this.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        "expiresIn": process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        "expiresIn": process.env.REFRESH_TOKEN_EXPIRY
    })
}


export const User = new mongoose.model('User', userSchema)