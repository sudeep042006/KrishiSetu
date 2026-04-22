import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserOrProfile } from '../../../../services/chatApi';

export default function BuyerProfileWindow({ navigation, route }) {
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
                    <Text className="text-xl font-semibold text-white ml-2">Buyer Profile</Text>
                </View>

                <ScrollView className="flex-1 bg-[#f6f8f5]">
                    {/* Top Section */}
                    <View className="bg-white px-5 py-6 items-center border-b border-gray-200">
                        <View className="w-24 h-24 rounded-full bg-[#1B4332] justify-center items-center mb-3 shadow-md border-4 border-[#e4f0e9]">
                            <Text className="text-white text-4xl font-bold">{user.name.charAt(0)}</Text>
                        </View>
                        <Text className="text-2xl font-bold text-gray-900">{profile?.companyName || user.name}</Text>
                        <Text className="text-[#3b82f6] text-sm mt-1 uppercase font-semibold tracking-wider">
                            {profile?.businessType || 'Buyer'}
                        </Text>
                        
                        <View className="flex-row mt-4">
                            <TouchableOpacity className="bg-white border border-[#1B4332] px-6 py-2 rounded-full shadow-sm">
                                <Text className="text-[#1B4332] font-medium">Call Business</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Details Section */}
                    <View className="p-5">
                        <Text className="text-lg font-bold text-gray-800 mb-4">Business Details</Text>
                        
                        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                            <View className="flex-row items-center mb-4">
                                <Text className="w-8 text-xl">🏢</Text>
                                <View>
                                    <Text className="text-xs text-gray-400 font-medium">Location</Text>
                                    <Text className="text-gray-800 font-medium">{profile?.headquarters?.city ? `${profile.headquarters.city}, ${profile.headquarters.state}` : user.address || 'Address not provided'}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center mb-4">
                                <Text className="w-8 text-xl">📦</Text>
                                <View>
                                    <Text className="text-xs text-gray-400 font-medium">Procurement Capacity</Text>
                                    <Text className="text-gray-800 font-medium">
                                        {profile?.procurementCapacity ? `${profile.procurementCapacity} ${profile.procurementUnit}` : 'Not specified'}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row items-center mb-2">
                                <Text className="w-8 text-xl">☎️</Text>
                                <View>
                                    <Text className="text-xs text-gray-400 font-medium">Contact Phone</Text>
                                    <Text className="text-gray-800 font-medium">{profile?.companyPhone || user.phone || 'Not specified'}</Text>
                                </View>
                            </View>
                        </View>

                        <Text className="text-lg font-bold text-gray-800 mb-4">Preferred Commodities</Text>
                        <View className="flex-row flex-wrap">
                            {profile?.preferredCrops && profile.preferredCrops.length > 0 ? (
                                profile.preferredCrops.map((crop, idx) => (
                                    <View key={idx} className="bg-[#e0f2fe] px-4 py-2 rounded-full mr-2 mb-2">
                                        <Text className="text-[#0369a1] font-semibold">{crop}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text className="text-gray-500 italic">No preferences listed</Text>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
