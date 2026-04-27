import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StatusBar,
    Keyboard,
    Alert
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
    Lock,
    Trash2,
    X,
    CheckCircle2
} from 'lucide-react-native';
import { getChatMessages, deleteMessages } from '../../../../services/chatApi';
import socketService from '../../../../services/socket';
import { ThemeContext } from '../../../../context/ThemeContext';

function AvatarPlaceholder({ name = "Unknown", size = 40 }) {
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#1e4e8c', '#1d4ed8', '#2563eb', '#1e40af'];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.35 }}>{initials}</Text>
        </View>
    );
}

function ChatHeader({ chatTitle, otherUserId, navigation, isSelectionMode, selectedCount, onCancelSelection, onDeleteSelected }) {
    if (isSelectionMode) {
        return (
            <View className="flex-row items-center px-4 py-3 bg-[#123524] border-b border-white/5">
                <TouchableOpacity onPress={onCancelSelection} className="mr-4 p-1.5 rounded-full bg-white/10">
                    <X size={22} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg flex-1">{selectedCount} selected</Text>
                <TouchableOpacity onPress={onDeleteSelected} className="p-2 rounded-full bg-red-500/20">
                    <Trash2 size={22} color="#f87171" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-row items-center px-4 py-3 bg-[#123524] border-b border-white/5">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2 p-1.5 rounded-full bg-white/10">
                <ChevronLeft size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
                className="flex-row items-center flex-1"
                onPress={() => navigation.navigate('FarmerProfileWindow', { userId: otherUserId })}
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

function MessageBubble({ message, isMine, onLongPress, onPress, isSelected, isSelectionMode }) {
    const messageTime = new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <TouchableOpacity
            onLongPress={() => onLongPress(message._id)}
            onPress={() => isSelectionMode ? onPress(message._id) : null}
            activeOpacity={0.7}
            className={`flex-row mb-3 px-4 ${isMine ? 'justify-end' : 'justify-start'} ${isSelected ? 'bg-emerald-500/10' : ''}`}
        >
            <View className="flex-row items-end max-w-[85%]">
                {isSelectionMode && (
                    <View className="mr-2 mb-2">
                        {isSelected ? (
                            <CheckCircle2 size={18} color="#10b981" fill="#10b981" />
                        ) : (
                            <View className="w-[18px] h-[18px] rounded-full border border-gray-300" />
                        )}
                    </View>
                )}

                <View className={`${isMine ? 'bg-[#123524] rounded-tr-sm' : 'bg-white rounded-tl-sm border border-gray-100'} rounded-2xl px-4 py-2.5 shadow-sm`}>
                    <Text className={`${isMine ? 'text-white font-medium' : 'text-gray-800'} text-sm leading-6`}>
                        {message.message}
                    </Text>
                    <View className="flex-row justify-end items-center mt-1 gap-x-1 opacity-70">
                        <Text className={`${isMine ? 'text-emerald-200' : 'text-gray-400'} text-[9px] font-bold uppercase`}>
                            {messageTime}
                        </Text>
                        {isMine && <CheckCheck size={12} color="#A7F3D0" />}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function MessageWindowScreen({ navigation, route }) {
    const { chatId, chatTitle, otherUserId } = route.params;
    const { isDarkMode } = useContext(ThemeContext);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedMessages, setSelectedMessages] = useState(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
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

            const res = await getChatMessages(chatId);
            if (res.success) {
                setMessages(res.messages);
            }

            socketService.joinChatRoom(chatId);

            socketService.subscribeToMessages((err, msg) => {
                if (err) return;
                setMessages(prev => {
                    if (prev.find(m => (m._id && m._id === msg._id) || (m.tempId && msg.tempId && m.tempId === msg.tempId))) return prev;
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
        if (messages.length > 0) {
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

    const handleLongPress = (id) => {
        if (!id) return; // Ignore messages without ID (temp messages)
        setIsSelectionMode(true);
        const next = new Set(selectedMessages);
        next.add(id);
        setSelectedMessages(next);
    };

    const handlePress = (id) => {
        if (!id) return;
        const next = new Set(selectedMessages);
        if (next.has(id)) {
            next.delete(id);
            if (next.size === 0) setIsSelectionMode(false);
        } else {
            next.add(id);
        }
        setSelectedMessages(next);
    };

    const cancelSelection = () => {
        setIsSelectionMode(false);
        setSelectedMessages(new Set());
    };

    const deleteSelected = () => {
        if (selectedMessages.size === 0) return;

        Alert.alert(
            "Delete Messages",
            `Are you sure you want to delete ${selectedMessages.size} selected messages?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const idsToDelete = Array.from(selectedMessages);
                            const res = await deleteMessages(idsToDelete);
                            if (res.success) {
                                setMessages(prev => prev.filter(m => !selectedMessages.has(m._id)));
                                cancelSelection();
                            }
                        } catch (error) {
                            Alert.alert("Error", "Could not delete messages.");
                        }
                    }
                }
            ]
        );
    };

    const headerBg = isDarkMode ? '#0f1f3d' : '#1e4e8c';
    const bodyBg = isDarkMode ? '#0d1117' : '#f8fafc';
    const encryptBg = isDarkMode ? 'rgba(30,58,96,0.3)' : '#eff6ff';
    const encryptBorderColor = isDarkMode ? '#1e3a5f' : '#bfdbfe';
    const encryptTextColor = isDarkMode ? '#3b82f6' : '#1e4e8c';
    const inputAreaBg = isDarkMode ? '#0f172a' : '#ffffff';
    const inputBg = isDarkMode ? '#1e293b' : '#f8fafc';
    const inputBorder = isDarkMode ? '#334155' : '#f1f5f9';
    const inputTextColor = isDarkMode ? '#e2e8f0' : '#1e293b';
    const sendBg = isDarkMode ? '#1d4ed8' : '#1e4e8c';
    const iconColor = isDarkMode ? '#475569' : '#6b7280';

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#0a0f1e' : '#1e4e8c' }}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: headerBg, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                    {isSelectionMode ? (
                        <>
                            <TouchableOpacity onPress={cancelSelection} style={{ marginRight: 16, padding: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                <X size={22} color="#fff" />
                            </TouchableOpacity>
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17, flex: 1 }}>{selectedMessages.size} selected</Text>
                            <TouchableOpacity onPress={deleteSelected} style={{ padding: 8, borderRadius: 20, backgroundColor: 'rgba(248,113,113,0.2)' }}>
                                <Trash2 size={22} color="#f87171" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8, padding: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                <ChevronLeft size={22} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={() => navigation.navigate('FarmerProfileWindow', { userId: otherUserId })}>
                                <AvatarPlaceholder name={chatTitle} size={40} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{chatTitle}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80', marginRight: 6 }} />
                                        <Text style={{ color: 'rgba(134,239,172,0.8)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>Active Now</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <MoreVertical size={20} color="#fff" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    <View style={{ flex: 1, backgroundColor: bodyBg, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }}>
                        {/* Encrypted label */}
                        <View style={{ paddingVertical: 10, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, backgroundColor: encryptBg, borderRadius: 20, borderWidth: 1, borderColor: encryptBorderColor, gap: 6 }}>
                                <Lock size={10} color={encryptTextColor} />
                                <Text style={{ fontSize: 10, color: encryptTextColor, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 }}>Encrypted Communication</Text>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            {loading ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color={isDarkMode ? '#3b82f6' : '#1e4e8c'} />
                                </View>
                            ) : (
                                <FlashList
                                    ref={flatListRef}
                                    data={messages}
                                    keyExtractor={(item) => item._id || item.tempId}
                                    estimatedItemSize={80}
                                    contentContainerStyle={{ paddingVertical: 20 }}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => {
                                        const isMine = item.senderId === currentUserId;
                                        const isSelected = selectedMessages.has(item._id);
                                        const myBg = isDarkMode ? '#1e3a5f' : '#1e4e8c';
                                        const otherBg = isDarkMode ? '#1e293b' : '#ffffff';
                                        const otherBorder = isDarkMode ? '#334155' : '#f1f5f9';
                                        const otherText = isDarkMode ? '#e2e8f0' : '#1e293b';
                                        const timeMine = isDarkMode ? '#93c5fd' : '#bfdbfe';
                                        const timeOther = isDarkMode ? '#475569' : '#94a3b8';
                                        const msgTime = new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        return (
                                            <TouchableOpacity
                                                onLongPress={() => { if (item._id) { setIsSelectionMode(true); const s = new Set(selectedMessages); s.add(item._id); setSelectedMessages(s); } }}
                                                onPress={() => { if (isSelectionMode && item._id) { const s = new Set(selectedMessages); s.has(item._id) ? s.delete(item._id) : s.add(item._id); if (s.size === 0) setIsSelectionMode(false); setSelectedMessages(s); } }}
                                                activeOpacity={0.7}
                                                style={{ flexDirection: 'row', marginBottom: 12, paddingHorizontal: 16, justifyContent: isMine ? 'flex-end' : 'flex-start', backgroundColor: isSelected ? (isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(30,78,140,0.06)') : 'transparent' }}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '85%' }}>
                                                    {isSelectionMode && (
                                                        <View style={{ marginRight: 8, marginBottom: 8 }}>
                                                            {isSelected ? <CheckCircle2 size={18} color="#3b82f6" fill="#3b82f6" /> : <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#94a3b8' }} />}
                                                        </View>
                                                    )}
                                                    <View style={[{ borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 }, isMine ? { backgroundColor: myBg, borderTopRightRadius: 4 } : { backgroundColor: otherBg, borderTopLeftRadius: 4, borderWidth: 1, borderColor: otherBorder }]}>
                                                        <Text style={{ color: isMine ? '#fff' : otherText, fontSize: 14, lineHeight: 22 }}>{item.message}</Text>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4, gap: 4, opacity: 0.7 }}>
                                                            <Text style={{ color: isMine ? timeMine : timeOther, fontSize: 9, fontWeight: '700' }}>{msgTime}</Text>
                                                            {isMine && <CheckCheck size={12} color={timeMine} />}
                                                        </View>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }}
                                    onContentSizeChange={() => { if (messages.length > 0) flatListRef.current?.scrollToEnd({ animated: true }); }}
                                />
                            )}
                        </View>

                        {!isSelectionMode && (
                            <View style={{ backgroundColor: inputAreaBg, borderTopWidth: 1, borderTopColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                                <SafeAreaView edges={['bottom']}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
                                        <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: inputBg, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: inputBorder }}>
                                            <Paperclip size={20} color={iconColor} />
                                        </TouchableOpacity>
                                        <View style={{ flex: 1, backgroundColor: inputBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: inputBorder }}>
                                            <TextInput
                                                style={{ fontSize: 14, color: inputTextColor, minHeight: 40, maxHeight: 128 }}
                                                placeholder="Type a message..."
                                                placeholderTextColor={iconColor}
                                                value={inputText}
                                                onChangeText={setInputText}
                                                multiline
                                                onFocus={() => setTimeout(() => { if (messages.length > 0) flatListRef.current?.scrollToEnd({ animated: true }); }, 300)}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={inputText.trim() ? sendMessage : undefined}
                                            style={{ width: 48, height: 48, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: inputText.trim() ? sendBg : inputBg }}
                                            activeOpacity={0.8}
                                        >
                                            {inputText.trim() ? <Send size={20} color="#fff" /> : <Mic size={20} color={iconColor} />}
                                        </TouchableOpacity>
                                    </View>
                                </SafeAreaView>
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}