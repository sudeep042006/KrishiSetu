import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform, 
    ActivityIndicator,
    StatusBar,
    Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    ChevronLeft, 
    MoreVertical, 
    Send, 
    Paperclip, 
    Mic, 
    CheckCheck,
    Lock
} from 'lucide-react-native';
import { getChatMessages } from '../../../../services/chatApi';
import socketService from '../../../../services/socket';

function AvatarPlaceholder({ name = "Unknown", size = 40 }) {
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#065f46', '#047857', '#059669', '#10b981'];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} className="justify-center items-center shadow-sm">
            <Text className="text-white font-bold" style={{ fontSize: size * 0.35 }}>{initials}</Text>
        </View>
    );
}

function ChatHeader({ chatTitle, otherUserId, navigation }) {
    return (
        <View className="flex-row items-center px-4 py-3 bg-[#123524] border-b border-white/5">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2 p-1.5 rounded-full bg-white/10">
                <ChevronLeft size={22} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
                className="flex-row items-center flex-1"
                onPress={() => navigation.navigate('ProfileWindow', { userId: otherUserId })}
            >
                <AvatarPlaceholder name={chatTitle} size={40} />
                <View className="ml-3">
                    <Text className="text-white font-bold text-base tracking-tight">
                        {chatTitle}
                    </Text>
                    <View className="flex-row items-center">
                        <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                        <Text className="text-emerald-300/80 text-[10px] font-bold uppercase tracking-widest">Active Now</Text>
                    </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity className="p-2 rounded-full bg-white/5">
                <MoreVertical size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

function MessageBubble({ message, isMine }) {
    const messageTime = new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isMine) {
        return (
            <View className="flex-row justify-end mb-3 px-4">
                <View className="bg-[#123524] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] shadow-md shadow-black/20">
                    <Text className="text-white text-sm leading-6 font-medium">{message.message}</Text>
                    <View className="flex-row justify-end items-center mt-1 gap-x-1 opacity-70">
                        <Text className="text-emerald-200 text-[9px] font-bold uppercase">{messageTime}</Text>
                        <CheckCheck size={12} color="#A7F3D0" />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-row justify-start mb-3 px-4">
            <View className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%] shadow-sm border border-gray-100">
                <Text className="text-gray-800 text-sm leading-6">{message.message}</Text>
                <Text className="text-gray-400 text-[9px] mt-1 font-bold uppercase">{messageTime}</Text>
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
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const flatListRef = useRef(null);

    useEffect(() => {
        socketService.initiateSocketConnection();
        setupChat();

        const showSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                setTimeout(scrollToBottom, 50);
            }
        );
        const hideSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardHeight(0)
        );

        return () => {
            socketService.leaveChatRoom(chatId);
            showSub.remove();
            hideSub.remove();
        };
    }, [chatId]);

    const setupChat = async () => {
        try {
            setLoading(true);
            const uid = await AsyncStorage.getItem('userId');
            setCurrentUserId(uid);
            
            const res = await getChatMessages(chatId);
            if (res.success) {
                setMessages(res.messages);
            }

            socketService.joinChatRoom(chatId);
            
            socketService.subscribeToMessages((err, msg) => {
                if (err) return;
                setMessages(prev => {
                    if(prev.find(m => (m._id && m._id === msg._id) || (m.tempId && msg.tempId && m.tempId === msg.tempId))) return prev;
                    return [...prev, msg];
                });
            });
            
        } catch (error) {
            console.error("Error setting up chat:", error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        if(messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
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

        setMessages((prev) => [...prev, newMsg]);
        setInputText('');
        
        socketService.sendMessage(newMsg);
    };

    return (
        <View className="flex-1 bg-[#123524]" style={{ paddingBottom: Platform.OS === 'android' ? keyboardHeight : 0 }}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView edges={['top']} className="flex-1">
                <ChatHeader chatTitle={chatTitle} otherUserId={otherUserId} navigation={navigation} />

                <KeyboardAvoidingView 
                    className="flex-1"
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={0}
                >
                    <View className="flex-1 bg-[#f8faf9] rounded-t-[40px] overflow-hidden">
                        <View className="py-3 items-center bg-white/50 border-b border-gray-100">
                            <View className="flex-row items-center px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100/50">
                                <Lock size={10} color="#059669" />
                                <Text className="text-[10px] text-emerald-700 font-bold ml-1 uppercase tracking-tighter">Encrypted Communication</Text>
                            </View>
                        </View>

                        <View className="flex-1">
                            {loading ? (
                                <View className="flex-1 justify-center items-center">
                                    <ActivityIndicator size="large" color="#123524" />
                                </View>
                            ) : (
                                <FlashList
                                    ref={flatListRef}
                                    data={messages}
                                    keyExtractor={(item) => item._id || item.tempId}
                                    estimatedItemSize={80}
                                    contentContainerStyle={{ paddingVertical: 20 }}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => <MessageBubble message={item} isMine={item.senderId === currentUserId} />}
                                    onContentSizeChange={scrollToBottom}
                                />
                            )}
                        </View>

                        <View className="bg-white border-t border-gray-100">
                            <SafeAreaView edges={['bottom']}>
                                <View className="flex-row items-center px-4 py-3 gap-x-2">
                                    <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
                                        <Paperclip size={20} color="#6b7280" />
                                    </TouchableOpacity>

                                    <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-1.5 border border-gray-100">
                                        <TextInput
                                            className="text-sm text-gray-800 min-h-[40px] max-h-32"
                                            placeholder="Type a message..."
                                            placeholderTextColor="#9ca3af"
                                            value={inputText}
                                            onChangeText={setInputText}
                                            multiline
                                        />
                                    </View>

                                    <TouchableOpacity 
                                        onPress={inputText.trim() ? sendMessage : undefined} 
                                        className={`w-12 h-12 rounded-2xl items-center justify-center shadow-lg ${inputText.trim() ? 'bg-[#123524] shadow-emerald-900/30' : 'bg-gray-100'}`}
                                        activeOpacity={0.8}
                                    >
                                        {inputText.trim() ? (
                                            <Send size={20} color="#fff" />
                                        ) : (
                                            <Mic size={20} color="#6b7280" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </SafeAreaView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}