import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserOrProfile } from '../../../../services/chatApi';

export default function FarmerProfileWindow({ navigation, route }) {
    const { userId } = route.params;
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (userId) loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await getUserOrProfile(userId);
            if (res.success) {
                setUser(res.user);
                setProfile(res.profile);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#123524] justify-center items-center">
                <ActivityIndicator size="large" color="#ffffff" />
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-[#123524] justify-center items-center">
                <Text className="text-white text-lg">Profile not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 px-4 py-2 bg-[#1B4332] rounded-lg">
                    <Text className="text-white">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <View className="flex-row items-center px-4 py-3">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                        <Text className="text-white text-2xl">←</Text>
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold text-white ml-2">Farmer Profile</Text>
                </View>

                <ScrollView className="flex-1 bg-[#f6f8f5]">
                    {/* Top Section */}
                    <View className="bg-white px-5 py-6 items-center border-b border-gray-200">
                        {profile?.profilePhoto ? (
                            <Image source={{ uri: profile.profilePhoto }} className="w-24 h-24 rounded-full mb-3" />
                        ) : (
                            <View className="w-24 h-24 rounded-full bg-[#1B4332] justify-center items-center mb-3">
                                <Text className="text-white text-3xl font-bold">{user.name.charAt(0)}</Text>
                            </View>
                        )}
                        <Text className="text-2xl font-bold text-gray-900">{user.name}</Text>
                        <Text className="text-gray-500 text-base mt-1">Verified Farmer</Text>
                        
                        <View className="flex-row mt-4">
                            <TouchableOpacity className="bg-white border border-[#1B4332] px-6 py-2 rounded-full shadow-sm">
                                <Text className="text-[#1B4332] font-medium">Call</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Details Section */}
                    <View className="p-5">
                        <Text className="text-lg font-bold text-gray-800 mb-4">Farm Details</Text>
                        
                        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                            <View className="flex-row items-center mb-4">
                                <Text className="w-8 text-xl">📍</Text>
                                <View>
                                    <Text className="text-xs text-gray-400 font-medium">Location</Text>
                                    <Text className="text-gray-800 font-medium">{profile?.village ? `${profile.village}, ${profile.district}, ${profile.state}` : user.address || 'Address not provided'}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center mb-4">
                                <Text className="w-8 text-xl">🌾</Text>
                                <View>
                                    <Text className="text-xs text-gray-400 font-medium">Land Area</Text>
                                    <Text className="text-gray-800 font-medium">{profile?.landArea || 'Not specified'}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center mb-2">
                                <Text className="w-8 text-xl">📞</Text>
                                <View>
                                    <Text className="text-xs text-gray-400 font-medium">Phone</Text>
                                    <Text className="text-gray-800 font-medium">{user.phone || profile?.phone || 'Not specified'}</Text>
                                </View>
                            </View>
                        </View>

                        <Text className="text-lg font-bold text-gray-800 mb-4">Crops Grown</Text>
                        <View className="flex-row flex-wrap">
                            {profile?.crops && profile.crops.length > 0 ? (
                                profile.crops.map((crop, idx) => (
                                    <View key={idx} className="bg-[#e4f0e9] px-4 py-2 rounded-full mr-2 mb-2">
                                        <Text className="text-[#1B4332] font-semibold">{crop}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text className="text-gray-500 italic">No crops listed</Text>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
