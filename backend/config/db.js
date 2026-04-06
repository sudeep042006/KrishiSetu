import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ConnectDB = async () =>{
    try{
        await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
        console.log("Database connected");
    }catch(error){
        console.log("Database connection error",error);
    }
}

export default ConnectDB;