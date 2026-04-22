import { Server } from "socket.io";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected to socket: ${socket.id}`);

        // Join private user room (if we want to send notifications to this user irrespective of chat)
        socket.on("join_user_room", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their personal room`);
        });

        // Join specific chat room
        socket.on("join_chat", ({ chatId }) => {
            socket.join(chatId);
            console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
        });

        // Leave specific chat room
        socket.on("leave_chat", ({ chatId }) => {
            socket.leave(chatId);
            console.log(`Socket ${socket.id} left chat room: ${chatId}`);
        });

        // Handle sending messages
        socket.on("send_message", async (data) => {
            const { chatId, senderId, receiverId, message } = data;

            try {
                // 1. Save message to database
                const newMessage = new Message({
                    chatId,
                    senderId,
                    receiverId,
                    message
                });
                await newMessage.save();

                // 2. Update chat's last message and timestamp
                await Chat.findByIdAndUpdate(chatId, {
                    lastMessage: message,
                    updatedAt: Date.now()
                });

                const messageData = {
                    ...newMessage.toObject(),
                    id: newMessage._id.toString() 
                };

                // 3. Emit message to everyone in the chat room (including sender to ack)
                io.to(chatId).emit("receive_message", messageData);
                
            } catch (error) {
                console.error("Socket error saving message:", error);
                socket.emit("message_error", { error: "Failed to send message" });
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected from socket: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
