import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

// create or fetch existing chat
export const createChat = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        if (!senderId || !receiverId) {
            return res.status(400).json({ success: false, message: "senderId and receiverId are required" });
        }

        // Check if chat exists
        let chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!chat) {
            chat = new Chat({
                participants: [senderId, receiverId],
                lastMessage: ""
            });
            await chat.save();
        }

        return res.status(200).json({ success: true, chat });
    } catch (error) {
        console.error("Create Chat Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getUserChats = async (req, res) => {
    try {
        const { userId } = req.params;
        const chats = await Chat.find({ participants: userId })
            .populate({
                path: 'participants',
                select: 'name role' // Only need name and role for display
            })
            .sort({ updatedAt: -1 });
            
        return res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error("Get User Chats Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
        return res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Get Messages Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteMessages = async (req, res) => {
    try {
        const { messageIds } = req.body;
        if (!messageIds || !Array.isArray(messageIds)) {
            return res.status(400).json({ success: false, message: "messageIds array required" });
        }
        await Message.deleteMany({ _id: { $in: messageIds } });
        return res.status(200).json({ success: true, message: "Messages deleted" });
    } catch (error) {
        console.error("Delete Messages Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        await Chat.findByIdAndDelete(chatId);
        await Message.deleteMany({ chatId });
        return res.status(200).json({ success: true, message: "Chat and associated messages deleted" });
    } catch (error) {
        console.error("Delete Chat Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};
