import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../../common/BHeader';
import { getUserChats, deleteChat } from '../../../../services/chatApi';
import { Trash2, Search, MessageSquare } from 'lucide-react-native';

const FILTERS = ['All', 'Farmers', 'Buyers', 'Orders'];

// Avatar placeholder
function AvatarPlaceholder({ name, size = 48 }) {
    if (!name) name = "User";
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#2D6A4F', '#40916C', '#52B788', '#1B4332', '#74C69D'];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <View
            style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }}
            className="justify-center items-center"
        >
            <Text className="text-white font-bold" style={{ fontSize: size * 0.35 }}>
                {initials}
            </Text>
        </View>
    );
}

function ChatItem({ item, onPress, onLongPress, currentUserId }) {
    // Determine the OTHER participant
    const otherUser = item.participants.find(p => p._id !== currentUserId) || item.participants[0];
    
    return (
        <TouchableOpacity
            onPress={() => onPress(item, otherUser)}
            onLongPress={() => onLongPress(item, otherUser)}
            activeOpacity={0.7}
            className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100"
        >
            {/* Avatar */}
            <View className="relative mr-3">
                {otherUser?.profileImage ? (
                    <Image source={{ uri: otherUser.profileImage }} className="w-12 h-12 rounded-full" />
                ) : (
                    <AvatarPlaceholder name={otherUser?.name} size={48} />
                )}
            </View>

            {/* Content */}
            <View className="flex-1">
                <View className="flex-row justify-between items-center mb-0.5">
                    <Text className="text-base font-semibold text-gray-900">{otherUser?.name || "Unknown"}</Text>
                    <Text className="text-xs text-gray-400">
                        {new Date(item.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </Text>
                </View>
                <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-500 flex-1 mr-2" numberOfLines={1}>
                        {item.lastMessage || "Started a conversation"}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function MessageScreen({ navigation }) {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchText, setSearchText] = useState('');
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        loadChats();
    }, []);

    const loadChats = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const uid = await AsyncStorage.getItem('userId');
            setCurrentUserId(uid);
            
            if (uid) {
                const response = await getUserChats(uid);
                if (response.success) {
                    setChats(response.chats);
                }
            }
        } catch (error) {
            console.error("Error loading chats:", error);
        } finally {
            setLoading(false);
            if (isRefresh) setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadChats(true);
    };

    const handleDeleteChat = (chat, otherUser) => {
        Alert.alert(
            "Delete Conversation",
            `Are you sure you want to delete your conversation with ${otherUser?.name || "this user"}? This will also delete all messages.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await deleteChat(chat._id);
                            if (res.success) {
                                setChats(prev => prev.filter(c => c._id !== chat._id));
                            }
                        } catch (error) {
                            Alert.alert("Error", "Could not delete conversation.");
                        }
                    }
                }
            ]
        );
    };

    const filteredChats = chats.filter((chat) => {
        const otherUser = chat.participants.find(p => p._id !== currentUserId) || chat.participants[0];
        const matchesSearch = otherUser?.name?.toLowerCase().includes(searchText.toLowerCase()) || 
                              chat.lastMessage?.toLowerCase().includes(searchText.toLowerCase());

        const matchesFilter =
            activeFilter === 'All' ||
            (activeFilter === 'Farmers' && otherUser?.role === 'farmer') ||
            (activeFilter === 'Buyers' && (otherUser?.role === 'buyer' || otherUser?.role === 'offtaker'));

        return matchesSearch && matchesFilter;
    });

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Message" />

                <View className="flex-1 bg-[#f6f8f5]">
                    {/* Search Bar */}
                    <View className="px-4 pt-3 pb-2 bg-white">
                        <View className="flex-row items-center bg-[#f1f5f1] rounded-xl px-3 py-2">
                            <Search size={18} color="#9CA3AF" className="mr-2" />
                            <TextInput
                                className="flex-1 text-sm text-gray-700 ml-2"
                                placeholder="Search chats..."
                                placeholderTextColor="#9CA3AF"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>
                    </View>

                    {/* Filter Tabs */}
                    <View className="flex-row px-4 py-2 bg-white border-b border-gray-100">
                        {FILTERS.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                onPress={() => setActiveFilter(filter)}
                                className={`mr-2 px-4 py-1.5 rounded-full border ${
                                    activeFilter === filter
                                        ? 'bg-[#1B4332] border-[#1B4332]'
                                        : 'bg-white border-gray-300'
                                }`}
                            >
                                <Text
                                    className={`text-sm font-medium ${
                                        activeFilter === filter ? 'text-white' : 'text-gray-600'
                                    }`}
                                >
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Chat List using FlashList */}
                    {loading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#1B4332" />
                        </View>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <FlashList
                                data={filteredChats}
                                keyExtractor={(item) => item._id}
                                estimatedItemSize={76}
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                renderItem={({ item }) => (
                                    <ChatItem
                                        item={item}
                                        currentUserId={currentUserId}
                                        onPress={(chat, otherUser) =>
                                            navigation.navigate('MessageWindow', { chatId: chat._id, chatTitle: otherUser.name, otherUserId: otherUser._id })
                                        }
                                        onLongPress={handleDeleteChat}
                                    />
                                )}
                                ListEmptyComponent={
                                    <View className="flex-1 justify-center items-center py-20">
                                        <MessageSquare size={48} color="#9CA3AF" className="mb-3" />
                                        <Text className="text-gray-500 text-base mt-2">No chats found</Text>
                                    </View>
                                }
                            />
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}