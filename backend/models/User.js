import mongoose from 'mongoose';
import { boolean, number } from 'zod';

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    supabaseId:{
        type:String,
        unique:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
    },
    role:{
        type:String,
        enum:["farmer","buyer","offtaker","admin"],
        default:"farmer"
    },
    phone:{
        type:String,
    },
    addhar_no:{
        type:Number,
    },
    address:{
        type:String,
    },
    isVerified:{
        type:Boolean,
        required:true,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
})

const User = mongoose.model("User",UserSchema);

export default User;