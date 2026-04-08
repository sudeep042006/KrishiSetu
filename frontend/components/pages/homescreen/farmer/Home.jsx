import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { useEffect } from 'react';

import { 
    Menu, 
    Bell, 
    Leaf, 
    CloudSun, 
    Sparkles, 
    MessageCircleQuestion, 
    Store, 
    FlaskConical, 
    Tractor,
    ChevronRight,
    TrendingUp
} from 'lucide-react-native';
import { getProfilePhotobyId } from '../../service/api';
export default function Home() {
    const navigation = useNavigation();
    const [farmer, setFarmer] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState('');

    useEffect(() => {
        fetchFarmerData();
    }, []);

    const fetchFarmerData = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('userData');
            console.log("Stored user data in Home:", userDataStr ? "Found" : "Not Found");

            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                setFarmer(userData);
                
                // Fetch profile photo using the ID
                if (userData._id) {
                    const photoData = await getProfilePhotobyId(userData._id);
                    setProfilePhoto(photoData?.profilePhoto || '');
                }
            } else {
                console.log('No user data found in storage');
            }
        } catch (error) {
            console.log('Error fetching farmer data:', error);
        }
    };

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Custom Rich Header */}
                <View className="flex-row items-center justify-between px-5 pt-4 pb-6">
                    <View className="flex-row items-center">
                        <TouchableOpacity 
                            className="mr-3" 
                            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                        >
                            <Menu color="#ffffff" size={24} />
                        </TouchableOpacity>
                        <Image 
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
                            className="w-10 h-10 rounded-full bg-white/20"
                        />
                        <View className="ml-3">
                            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                            <Text className="text-white/80 text-xs">Welcome back</Text>
                            <Text className="text-white text-base font-bold">
                                {farmer?.name || 'Loading...'}
                            </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity className="bg-white/10 p-2 rounded-full">
                        <Bell color="#ffffff" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Main Scrollable Content */}
                <ScrollView 
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Top Cards Row */}
                    <View className="flex-row justify-between px-5 mb-4">
                        <TouchableOpacity onPress={() => navigation.navigate('Crop List')}>
                        <View className="bg-white/10 p-4 rounded-3xl w-35 flex-1 mr-2 border border-white/5 shadow-sm">
                            <Text className="text-white/80 text-xs mb-1">Crops to Harvest</Text>
                            <Text className="text-white text-lg font-bold">3 Crops</Text>
                            <View className="mt-4 flex-row justify-end">
                                <Leaf color="#86efac" size={24} />
                            </View>
                        </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Weather')}>
                        <View className="bg-white/10 p-4 rounded-3xl w-60 flex-1 ml-2 border border-white/5 shadow-sm">
                            <View className="flex-row justify-between items-start mb-1">
                                <Text className="text-white/80 text-xs">Weather</Text>
                                <CloudSun color="#fef08a" size={24} />
                            </View>
                            <Text className="text-white text-lg font-bold mb-1">35°C</Text>
                            <Text className="text-white/80 text-sm">Sunny</Text>
                        </View>
                        </TouchableOpacity>

                    </View>

                    {/* AI Insight Card */}
                    <View className="px-5 mb-6">
                        <View className="bg-gradient-to-r bg-[#1e4a3b] p-4 rounded-3xl flex-row items-center border border-[#2d6a54] shadow-sm">
                            <View className="bg-[#4ade80]/20 p-3 rounded-full mr-4">
                                <Sparkles color="#4ade80" size={24} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-sm mb-1">AI Insight: Your Crop Advisory</Text>
                                <Text className="text-white/70 text-xs">Get quick tips for your crop health cues</Text>
                            </View>
                            <ChevronRight color="#4ade80" size={20} />
                        </View>
                    </View>

                    {/* Lower White Section */}
                    <View className="flex-1 bg-[#f8fafc] rounded-t-[32px] pt-6 px-5 min-h-screen shadow-lg shadow-black/20">
                        {/* Quick Actions */}
                        <Text className="text-[#1e4a3b] text-base font-bold mb-4">Quick Actions</Text>
                        <View className="flex-row justify-between mb-8">
                            <TouchableOpacity className="items-center">
                                <View className="bg-white p-4 rounded-full shadow-sm shadow-gray-200 mb-2 border border-green-50">
                                    <MessageCircleQuestion color="#16a34a" size={26} />
                                </View>
                                <Text className="text-gray-600 text-xs font-semibold">Q&A</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('Marketplace')} className="items-center">
                                <View className="bg-white p-4 rounded-full shadow-sm shadow-gray-200 mb-2 border border-green-50">
                                    <Store color="#16a34a" size={26} />
                                </View>
                                <Text className="text-gray-600 text-xs font-semibold">Sell Produce</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('Fertilizer')} className="items-center">
                                <View className="bg-white p-4 rounded-full shadow-sm shadow-gray-200 mb-2 border border-green-50">
                                    <FlaskConical color="#16a34a" size={26} />
                                </View>
                                <Text className="text-gray-600 text-xs font-semibold">Fertilizer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('Weather')} className="items-center">
                                <View className="bg-white p-4 rounded-full shadow-sm shadow-gray-200 mb-2 border border-green-50">
                                    <CloudSun color="#16a34a" size={26} />
                                </View>
                                <Text className="text-gray-600 text-xs font-semibold">Weather</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Harvest Timeline */}
                        <Text className="text-[#1e4a3b] text-base font-bold mb-4">Harvest Timeline</Text>
                        <View className="bg-white p-5 rounded-3xl flex-row items-center shadow-sm shadow-gray-200 border border-green-50">
                            <View className="bg-[#e9f5ef] p-3 rounded-2xl mr-4">
                                <Tractor color="#16a34a" size={28} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#1e4a3b] font-bold text-sm mb-1">Weekly Harvest Status</Text>
                                <Text className="text-[#16a34a] font-black text-xl mb-1">+280Kg</Text>
                                <Text className="text-gray-500 text-xs">Ready to Harvest</Text>
                            </View>
                            <View className="h-16 w-16 opacity-20 items-end justify-center">
                                <TrendingUp color="#16a34a" size={40} />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
