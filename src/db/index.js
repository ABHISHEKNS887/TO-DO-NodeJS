import mongoose from 'mongoose';
import { DB_NAME } from '../../constant.js';

const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log("DB Connected Successfully. DB Host: " + connectionInstance.connection.host);
    } catch (error) {
        console.error("DB connection Failed. Error: "+ error)
        process.exit(1);
    }
}

export default connectDB;