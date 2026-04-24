import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../../common/Header';
import { offtakerService } from '../../service/api';
import { createOrGetChat } from '../../../../services/chatApi';

function AvatarPlaceholder({ name = "Unknown", size = 48 }) {
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#059669', '#0891b2', '#2563eb', '#7c3aed', '#db2777'];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <View
            style={{ width: size, height: size, borderRadius: size / 2.5, backgroundColor: color }}
            className="justify-center items-center shadow-sm"
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

        const isVerified = item.isBusinessVerified || item.verificationStatus === 'verified';

        return (
            <View className="bg-white rounded-[24px] mx-4 mb-4 p-4 shadow-sm border border-gray-100">
                <View className="flex-row items-center mb-4">
                    <View className="mr-4">
                        {item.profilePhoto || userDetails.profileImage ? (
                            <Image 
                                source={{ uri: item.profilePhoto || userDetails.profileImage }} 
                                className="w-16 h-16 rounded-[20px]" 
                            />
                        ) : (
                            <AvatarPlaceholder name={item.companyName || userDetails.name} size={64} />
                        )}
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center">
                            <Text className="text-[17px] font-bold text-gray-900 mr-1" numberOfLines={1}>
                                {item.companyName || userDetails.name}
                            </Text>
                            {isVerified && (
                                <Text title="Verified" className="text-blue-500 text-xs">✔️</Text>
                            )}
                        </View>
                        <Text className="text-[13px] text-green-700 font-bold uppercase tracking-wider">
                            {item.businessType || 'OFFTAKER'}
                        </Text>
                        
                        <View className="flex-row items-center mt-1">
                            <Text className="text-gray-500 text-xs">📍 {item.headquarters?.city || 'India'}</Text>
                            {item.ratingAverage > 0 && (
                                <Text className="text-amber-500 text-xs ml-3">⭐ {item.ratingAverage.toFixed(1)}</Text>
                            )}
                        </View>
                    </View>
                </View>

                <View className="flex-row items-center pt-2 border-t border-gray-50">
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('OfftakerProfileWindow', { offtaker: item })}
                        className="flex-1 py-2.5 rounded-xl bg-gray-50 items-center justify-center border border-gray-100 mr-2"
                    >
                        <Text className="text-gray-700 font-bold text-[14px]">View Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => startChat(item)}
                        disabled={chattingId === userDetails._id}
                        className="flex-1 py-2.5 rounded-xl bg-[#1B4332] flex-row items-center justify-center shadow-sm"
                    >
                        {chattingId === userDetails._id ? (
                            <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                        ) : null}
                        <Text className="text-white font-bold text-[14px]">Message</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const filteredOfftakers = offtakers.filter((item) => {
        const name = item.companyName || item.userId?.name || '';
        const type = item.businessType || '';
        const city = item.headquarters?.city || '';
        const q = searchQuery.toLowerCase();
        return name.toLowerCase().includes(q) || type.toLowerCase().includes(q) || city.toLowerCase().includes(q);
    });

    return (
        <View className="flex-1 bg-[#123524]">
            <StatusBar barStyle="light-content" />
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Verified Buyers" />
                
                <View className="flex-1 bg-[#F8FAFC]">
                    {/* Search Container */}
                    <View className="px-4 pt-4 pb-2">
                        <View className="flex-row items-center bg-white rounded-[20px] px-4 py-3 shadow-sm border border-gray-100">
                            <Text className="mr-2 text-lg">🔍</Text>
                            <TextInput
                                className="flex-1 text-[15px] text-gray-800"
                                placeholder="Search by name, type or location..."
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                returnKeyType="search"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')} className="bg-gray-100 rounded-full p-1">
                                    <Text className="text-gray-400 text-[10px] font-bold">✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {loading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#1B4332" />
                            <Text className="mt-4 text-gray-500 font-medium">Finding available buyers...</Text>
                        </View>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <FlashList 
                                data={filteredOfftakers}
                                keyExtractor={(item) => item._id}
                                renderItem={renderOfftaker}
                                estimatedItemSize={160}
                                contentContainerStyle={{ paddingVertical: 12 }}
                                ListEmptyComponent={
                                    <View className="flex-1 justify-center items-center py-20 mt-10">
                                        <View className="w-20 h-20 bg-gray-50 rounded-full justify-center items-center mb-4">
                                            <Text className="text-4xl">🏢</Text>
                                        </View>
                                        <Text className="text-gray-900 font-bold text-lg">No Buyers Found</Text>
                                        <Text className="text-gray-500 text-center px-10 mt-2">
                                            {searchQuery ? "We couldn't find any buyers matching your search." : "There are no offtaker profiles available at the moment."}
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
