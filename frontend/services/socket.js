import { io } from 'socket.io-client';
import { API_BASE_URL } from '@env';

// API_BASE_URL is something like http://192.168.1.5:5000/api/v1
// Socket needs the domain without /api/v1. Let's slice it:
const SOCKET_URL = API_BASE_URL?.replace('/api/v1', '') || 'http://10.0.2.2:5000';


let socket;

export const initiateSocketConnection = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 500,
            reconnectionAttempts: 10,
        });
        console.log(`Socket connecting to ${SOCKET_URL}...`);
    }
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const subscribeToMessages = (cb) => {
    if (!socket) return true;
    socket.off('receive_message');
    socket.on('receive_message', msg => {
        return cb(null, msg);
    });
};

export const sendMessage = (data) => {
    if (socket) {
        socket.emit('send_message', data);
    }
};

export const joinChatRoom = (chatId) => {
    if (socket) {
        socket.emit('join_chat', { chatId });
    }
};

export const leaveChatRoom = (chatId) => {
    if (socket) {
        socket.emit('leave_chat', { chatId });
    }
};

export default {
    initiateSocketConnection,
    disconnectSocket,
    subscribeToMessages,
    sendMessage,
    joinChatRoom,
    leaveChatRoom
};
