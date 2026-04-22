import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    lastMessage: {
        type: String,
        default: ""
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Chat = mongoose.model("Chat", ChatSchema);
export default Chat;
