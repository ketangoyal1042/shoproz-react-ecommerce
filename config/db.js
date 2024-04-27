// Using ES6 imports
import mongoose from 'mongoose';

const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected to database Successfully ${conn.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.log(`Error connecting to: ${error.message}`.bgRed.white);
    }
}

export default connectDB;