import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getChatMessages } from '../../../../services/chatApi';
import socketService from '../../../../services/socket';

// Avatar placeholder
function AvatarPlaceholder({ name = "Unknown", size = 36 }) {
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    return (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#2D6A4F' }} className="justify-center items-center">
            <Text className="text-white font-bold" style={{ fontSize: size * 0.35 }}>{initials}</Text>
        </View>
    );
}

function ChatHeader({ chatTitle, otherUserId, navigation }) {
    return (
        <View className="flex-row items-center px-3 py-2 bg-[#1B4332]">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2 p-1">
                <Text className="text-white text-xl">←</Text>
            </TouchableOpacity>
            
            {/* Tappable Header to Profile Screen */}
            <TouchableOpacity 
                className="flex-row items-center flex-1"
                onPress={() => navigation.navigate('ProfileWindow', { userId: otherUserId })}
            >
                <View className="mr-3">
                    <AvatarPlaceholder name={chatTitle} size={36} />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-semibold text-base leading-tight">
                        {chatTitle}
                    </Text>
                    <Text className="text-green-300 text-xs">Tap for Profile</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity className="p-1">
                <Text className="text-white text-xl font-bold">⋮</Text>
            </TouchableOpacity>
        </View>
    );
}

function MessageBubble({ message, isMine }) {
    const messageTime = new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isMine) {
        return (
            <View className="flex-row justify-end mb-1.5 px-4">
                <View className="bg-[#1B4332] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[75%]">
                    <Text className="text-white text-sm leading-snug">{message.message}</Text>
                    <View className="flex-row justify-end items-center mt-0.5 gap-1">
                        <Text className="text-green-300 text-[10px]">{messageTime}</Text>
                        <Text className="text-green-300 text-[10px]">✓✓</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-row justify-start mb-1.5 px-4">
            <View className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[75%] shadow-sm">
                <Text className="text-gray-800 text-sm leading-snug">{message.message}</Text>
                <Text className="text-gray-400 text-[10px] mt-0.5">{messageTime}</Text>
            </View>
        </View>
    );
}

export default function MessageWindowScreen({ navigation, route }) {
    const { chatId, chatTitle, otherUserId } = route.params;
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        socketService.initiateSocketConnection();
        setupChat();
        return () => {
            socketService.leaveChatRoom(chatId);
        };
    }, [chatId]);

    const setupChat = async () => {
        try {
            setLoading(true);
            const uid = await AsyncStorage.getItem('userId');
            setCurrentUserId(uid);
            
            // Fetch history
            const res = await getChatMessages(chatId);
            if (res.success) {
                // Ensure messages are correctly structured
                setMessages(res.messages);
            }

            // Socket setup
            socketService.joinChatRoom(chatId);
            
            socketService.subscribeToMessages((err, msg) => {
                if (err) return;
                setMessages(prev => {
                    // prevent duplicate due to fast UI append vs socket return
                    if(prev.find(m => m._id === msg._id || m.tempId === msg.tempId)) return prev;
                    return [...prev, msg];
                });
                scrollToBottom();
            });
            
        } catch (error) {
            console.error("Error setting up chat:", error);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    };

    const scrollToBottom = () => {
        if(messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }

    const sendMessage = () => {
        const text = inputText.trim();
        if (!text) return;

        const tempId = Date.now().toString();
        const newMsg = {
            tempId,
            chatId,
            senderId: currentUserId,
            receiverId: otherUserId,
            message: text,
            createdAt: new Date().toISOString()
        };

        // Append locally instantly
        setMessages((prev) => [...prev, newMsg]);
        setInputText('');
        scrollToBottom();

        // Emit via socket
        socketService.sendMessage(newMsg);
    };

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <ChatHeader chatTitle={chatTitle} otherUserId={otherUserId} navigation={navigation} />

                <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
                    <View className="bg-[#f6f8f5] px-4 py-1.5 items-center border-b border-gray-200">
                        <Text className="text-xs text-gray-400">🔒 Messages are end-to-end encrypted</Text>
                    </View>

                    {loading ? (
                         <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#1B4332" />
                        </View>
                    ) : (
                        <View style={{ flex: 1, backgroundColor: '#f6f8f5' }}>
                            <FlashList
                                ref={flatListRef}
                                data={messages}
                                keyExtractor={(item) => item._id || item.tempId}
                                estimatedItemSize={60}
                                contentContainerStyle={{ paddingVertical: 12 }}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => <MessageBubble message={item} isMine={item.senderId === currentUserId} />}
                                onContentSizeChange={() => scrollToBottom()}
                            />
                        </View>
                    )}

                    <View className="flex-row items-center px-3 py-2 bg-white border-t border-gray-100">
                        <TouchableOpacity className="p-2 mr-1">
                            <Text className="text-gray-400 text-xl">📎</Text>
                        </TouchableOpacity>

                        <TextInput
                            className="flex-1 bg-[#f1f5f1] rounded-2xl px-4 py-2 text-sm text-gray-800 max-h-24"
                            placeholder="Type a message..."
                            placeholderTextColor="#9CA3AF"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            returnKeyType="send"
                            onSubmitEditing={sendMessage}
                        />

                        <TouchableOpacity onPress={inputText.trim() ? sendMessage : undefined} className="ml-2 w-10 h-10 rounded-full bg-[#1B4332] justify-center items-center" activeOpacity={0.8}>
                            {inputText.trim() ? <Text className="text-white text-base">➤</Text> : <Text className="text-white text-base">🎤</Text>}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}