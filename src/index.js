import connectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from 'dotenv'
import redis from 'redis';

dotenv.config({
    path: './env'
})

let redisClient;

((async() => {
    redisClient = redis.createClient();

    redisClient.on('error', (err) => console.error(`Error while connecting Redis: ${err}`));

    await redisClient.connect();
    console.log("Redis client connected")
})())

connectDB()
.then(() => {
    app.on('error', (error) => {
            console.error("App Error: ", error)
            throw error;
        })
    app.listen(process.env.PORT || 8000, () => {
        console.log('Server running on port ' + process.env.PORT)
    })
})
.catch((err) => {
    console.error(`DB Connection FAILED: ${err.message}`)
});

export {redisClient}