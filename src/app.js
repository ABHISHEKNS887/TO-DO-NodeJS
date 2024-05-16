import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
// Cross-Origin Resource Sharing: https://expressjs.com/en/resources/middleware/cors.html
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"})); // Setting limit for JSON responses.
app.use(express.urlencoded({extended: true, limit: "16kb"})); // converting url to readable we use urlencoded. like abhi%20shek.
app.use(express.static('public')) // Storing the files.
app.use(cookieParser());

import userRouter from './routes/user.route.js';
import todoRouter from './routes/todo.route.js';
import subTodoRouter from './routes/subTodo.route.js';

app.use('/api/v1/users/', userRouter);

app.use('/api/v1/todo/', todoRouter);

app.use('/api/v1/subTodo', subTodoRouter);

export {app}