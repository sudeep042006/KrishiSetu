import axios from 'axios';
import { API_BASE_URL } from '@env';

export const createOrGetChat = async (senderId, receiverId) => {
    const response = await axios.post(`${API_BASE_URL}/chat/create`, { senderId, receiverId });
    return response.data;
};

export const getUserChats = async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/chat/${userId}`);
    return response.data;
};

export const getChatMessages = async (chatId) => {
    const response = await axios.get(`${API_BASE_URL}/chat/messages/${chatId}`);
    return response.data;
};

export const getUserOrProfile = async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
    return response.data;
};

export const deleteMessages = async (messageIds) => {
    const response = await axios.post(`${API_BASE_URL}/chat/delete-messages`, { messageIds });
    return response.data;
};

export const deleteChat = async (chatId) => {
    const response = await axios.delete(`${API_BASE_URL}/chat/delete-chat/${chatId}`);
    return response.data;
};
