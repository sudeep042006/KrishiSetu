import mongoose  from 'mongoose';

const DocumentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    documentType:{
        type:String,
        required:true
    },
    documentUrl:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
});

const Document = mongoose.model("Document",DocumentSchema);

export default Document;
