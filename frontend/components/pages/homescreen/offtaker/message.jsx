import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../../common/BHeader';
import { getUserChats, deleteChat } from '../../../../services/chatApi';
import { Trash2, Search, MessageSquare, ChevronRight } from 'lucide-react-native';
import { ThemeContext } from '../../../../context/ThemeContext';

const FILTERS = ['All', 'Farmers', 'Buyers', 'Orders'];

// Avatar placeholder with bluish palette
function AvatarPlaceholder({ name, size = 48, isDark }) {
    if (!name) name = "User";
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    // Bluish color palette
    const colors = ['#1e4e8c', '#1d4ed8', '#2563eb', '#1e40af', '#3b82f6'];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
            }}
        >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.35 }}>
                {initials}
            </Text>
        </View>
    );
}

function ChatItem({ item, onPress, onLongPress, currentUserId, isDark }) {
    const otherUser = item.participants.find(p => p._id !== currentUserId) || item.participants[0];
    const timeStr = new Date(item.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" });

    return (
        <TouchableOpacity
            onPress={() => onPress(item, otherUser)}
            onLongPress={() => onLongPress(item, otherUser)}
            activeOpacity={0.75}
            style={[
                styles.chatItem,
                {
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                }
            ]}
        >
            {/* Avatar */}
            <View style={{ marginRight: 14 }}>
                {otherUser?.profileImage ? (
                    <Image
                        source={{ uri: otherUser.profileImage }}
                        style={{ width: 52, height: 52, borderRadius: 26 }}
                    />
                ) : (
                    <AvatarPlaceholder name={otherUser?.name} size={52} isDark={isDark} />
                )}
                {/* Online dot */}
                <View style={[
                    styles.onlineDot,
                    { backgroundColor: isDark ? '#22c55e' : '#16a34a' }
                ]} />
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text
                        style={[
                            styles.chatName,
                            { color: isDark ? '#f1f5f9' : '#0f172a' }
                        ]}
                        numberOfLines={1}
                    >
                        {otherUser?.name || "Unknown"}
                    </Text>
                    <Text style={[styles.chatTime, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                        {timeStr}
                    </Text>
                </View>
                <Text
                    style={[styles.chatPreview, { color: isDark ? '#64748b' : '#94a3b8' }]}
                    numberOfLines={1}
                >
                    {item.lastMessage || "Started a conversation"}
                </Text>
            </View>

            <ChevronRight size={18} color={isDark ? '#334155' : '#cbd5e1'} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
    );
}

export default function MessageScreen({ navigation }) {
    const { isDarkMode } = useContext(ThemeContext);
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
            `Delete conversation with ${otherUser?.name || "this user"}?`,
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
        const matchesSearch =
            otherUser?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            chat.lastMessage?.toLowerCase().includes(searchText.toLowerCase());

        const matchesFilter =
            activeFilter === 'All' ||
            (activeFilter === 'Farmers' && otherUser?.role === 'farmer') ||
            (activeFilter === 'Buyers' && (otherUser?.role === 'buyer' || otherUser?.role === 'offtaker'));

        return matchesSearch && matchesFilter;
    });

    // Theme colors
    const bg = isDarkMode ? '#0a0f1e' : '#14243e';           // header bg (kept as is)
    const bodyBg = isDarkMode ? '#0d1117' : '#f0f4f8';       // main body
    const cardBg = isDarkMode ? '#0f172a' : '#ffffff';
    const searchBg = isDarkMode ? '#1e293b' : '#ffffff';
    const searchInputBg = isDarkMode ? '#0f172a' : '#eff6ff'; // light blue tint
    const borderColor = isDarkMode ? '#1e293b' : '#dbeafe';
    const placeholderColor = isDarkMode ? '#475569' : '#94a3b8';
    const filterActiveBg = isDarkMode ? '#1d4ed8' : '#1e4e8c';
    const filterInactiveBg = isDarkMode ? '#1e293b' : '#eff6ff';
    const filterActiveText = '#ffffff';
    const filterInactiveText = isDarkMode ? '#64748b' : '#1e4e8c';
    const filterInactiveBorder = isDarkMode ? '#334155' : '#bfdbfe';

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <Header title="Message" />

                <View style={{ flex: 1, backgroundColor: bodyBg }}>

                    {/* Search + Filter Section */}
                    <View style={[styles.searchSection, { backgroundColor: searchBg, borderBottomColor: borderColor }]}>
                        {/* Search Bar */}
                        <View style={[styles.searchBar, { backgroundColor: searchInputBg, borderColor: isDarkMode ? '#334155' : '#bfdbfe' }]}>
                            <Search size={18} color={placeholderColor} />
                            <TextInput
                                style={[styles.searchInput, { color: isDarkMode ? '#e2e8f0' : '#0f172a' }]}
                                placeholder="Search conversations..."
                                placeholderTextColor={placeholderColor}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>

                        {/* Filter Pills */}
                        <View style={styles.filterRow}>
                            {FILTERS.map((filter) => {
                                const isActive = activeFilter === filter;
                                return (
                                    <TouchableOpacity
                                        key={filter}
                                        onPress={() => setActiveFilter(filter)}
                                        style={[
                                            styles.filterPill,
                                            {
                                                backgroundColor: isActive ? filterActiveBg : filterInactiveBg,
                                                borderColor: isActive ? filterActiveBg : filterInactiveBorder,
                                            }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.filterText,
                                            { color: isActive ? filterActiveText : filterInactiveText }
                                        ]}>
                                            {filter}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Chat List */}
                    {loading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text style={{ color: isDarkMode ? '#475569' : '#94a3b8', marginTop: 12, fontWeight: '600' }}>
                                Loading conversations...
                            </Text>
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
                                        isDark={isDarkMode}
                                        onPress={(chat, otherUser) =>
                                            navigation.navigate('MessageWindow', {
                                                chatId: chat._id,
                                                chatTitle: otherUser.name,
                                                otherUserId: otherUser._id
                                            })
                                        }
                                        onLongPress={handleDeleteChat}
                                    />
                                )}
                                ListHeaderComponent={() => (
                                    <View style={[styles.listHeader, { borderBottomColor: isDarkMode ? '#1e293b' : '#eff6ff' }]}>
                                        <Text style={[styles.listHeaderText, { color: isDarkMode ? '#64748b' : '#94a3b8' }]}>
                                            {filteredChats.length} CONVERSATION{filteredChats.length !== 1 ? 'S' : ''}
                                        </Text>
                                    </View>
                                )}
                                ListEmptyComponent={
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
                                        <View style={[
                                            styles.emptyIcon,
                                            { backgroundColor: isDarkMode ? '#1e293b' : '#eff6ff' }
                                        ]}>
                                            <MessageSquare size={36} color={isDarkMode ? '#334155' : '#bfdbfe'} />
                                        </View>
                                        <Text style={[styles.emptyTitle, { color: isDarkMode ? '#334155' : '#94a3b8' }]}>
                                            No conversations yet
                                        </Text>
                                        <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#1e293b' : '#cbd5e1' }]}>
                                            Start a chat from a farmer profile
                                        </Text>
                                    </View>
                                }
                                contentContainerStyle={{ paddingBottom: 100 }}
                            />
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    chatName: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    chatTime: {
        fontSize: 11,
        fontWeight: '600',
    },
    chatPreview: {
        fontSize: 13,
        fontWeight: '400',
    },
    searchSection: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 12,
        borderWidth: 1,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '700',
    },
    listHeader: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    listHeaderText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.2,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
});