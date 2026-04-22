import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../../common/Header';
import { offtakerService } from '../../service/api';
import { createOrGetChat } from '../../../../services/chatApi';

function AvatarPlaceholder({ name = "Unknown", size = 48 }) {
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];
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

export default function OfftakerProfilesScreen({ navigation }) {
    const [offtakers, setOfftakers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [chattingId, setChattingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const uid = await AsyncStorage.getItem('userId');
            setCurrentUserId(uid);

            const res = await offtakerService.getAllOfftakers();
            if (res.success) {
                setOfftakers(res.offtakers);
            }
        } catch (error) {
            console.error("Error fetching offtakers:", error);
        } finally {
            setLoading(false);
        }
    };

    const startChat = async (offtakerProfile) => {
        const offtakerUser = offtakerProfile.userId;
        if (!currentUserId || !offtakerUser?._id) return;

        try {
            setChattingId(offtakerUser._id);
            const res = await createOrGetChat(currentUserId, offtakerUser._id);
            
            if (res.success && res.chat) {
                // Navigate to MessageWindow directly
                navigation.navigate('MessageWindow', { 
                    chatId: res.chat._id, 
                    chatTitle: offtakerProfile.companyName || offtakerUser.name, 
                    otherUserId: offtakerUser._id 
                });
            }
        } catch (error) {
            console.error("Error creating chat:", error);
        } finally {
            setChattingId(null);
        }
    };

    const renderOfftaker = ({ item }) => {
        const userDetails = item.userId;
        if (!userDetails) return null;

        return (
            <View className="bg-white rounded-xl mx-4 mb-4 p-4 shadow-sm border border-gray-100 flex-row items-center">
                <View className="mr-4">
                    {userDetails.profileImage ? (
                        <Image source={{ uri: userDetails.profileImage }} className="w-16 h-16 rounded-full" />
                    ) : (
                        <AvatarPlaceholder name={item.companyName || userDetails.name} size={64} />
                    )}
                </View>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                        {item.companyName || userDetails.name}
                    </Text>
                    <Text className="text-sm text-blue-600 font-medium mb-1">
                        {item.businessType || 'Buyer'}
                    </Text>
                    
                    <View className="flex-row items-center mt-2">
                        <TouchableOpacity 
                            onPress={() => startChat(item)}
                            disabled={chattingId === userDetails._id}
                            className="bg-[#1B4332] px-4 py-2 rounded-lg flex-row items-center justify-center flex-1 mr-2"
                        >
                            {chattingId === userDetails._id ? (
                                <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                            ) : null}
                            <Text className="text-white font-semibold">Message</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('BuyerProfileWindow', { userId: userDetails._id })}
                            className="bg-gray-100 px-4 py-2 rounded-lg items-center justify-center border border-gray-200"
                        >
                            <Text className="text-gray-800 font-semibold">View Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    // Calculate filtered list
    const filteredOfftakers = offtakers.filter((item) => {
        const name = item.companyName || item.userId?.name || '';
        const type = item.businessType || '';
        const q = searchQuery.toLowerCase();
        return name.toLowerCase().includes(q) || type.toLowerCase().includes(q);
    });

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Offtaker Profiles" />
                
                <View className="flex-1 bg-[#f6f8f5]">
                    {/* Perfect Search Bar UI */}
                    <View className="px-4 pt-3 pb-3 bg-white border-b border-gray-100">
                        <View className="flex-row items-center bg-[#f1f5f1] rounded-xl px-3 py-2 border border-gray-200">
                            <Text className="text-gray-400 mr-2 text-base">🔍</Text>
                            <TextInput
                                className="flex-1 text-sm text-gray-800"
                                placeholder="Search by name or business type..."
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                returnKeyType="search"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                                    <Text className="text-gray-400 text-xs font-bold bg-gray-200 rounded-full px-1.5 py-0.5">X</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {loading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#1B4332" />
                            <Text className="mt-4 text-gray-600 font-medium">Loading Buyers...</Text>
                        </View>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <FlashList 
                                data={filteredOfftakers}
                                keyExtractor={(item) => item._id}
                                renderItem={renderOfftaker}
                                estimatedItemSize={120}
                                contentContainerStyle={{ paddingVertical: 16 }}
                                ListEmptyComponent={
                                    <View className="flex-1 justify-center items-center py-20 mt-10">
                                        <Text className="text-4xl mb-3">🏢</Text>
                                        <Text className="text-gray-500 text-base font-medium">
                                            {searchQuery ? "No matching buyers found." : "No offtakers available."}
                                        </Text>
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
