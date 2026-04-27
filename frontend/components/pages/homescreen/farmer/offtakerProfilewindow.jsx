import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Phone, Briefcase, Calendar, Star, ShieldCheck, Mail, Globe } from 'lucide-react-native';
import { getUserOrProfile } from '../../../../services/chatApi';

export default function OfftakerProfileWindow({ navigation, route }) {
    const { offtaker: initialOfftaker, userId } = route.params || {};
    const [offtaker, setOfftaker] = useState(initialOfftaker || null);
    const [loading, setLoading] = useState(!initialOfftaker);

    useEffect(() => {
        if (!offtaker && userId) {
            loadOfftakerData();
        }
    }, [userId]);

    const loadOfftakerData = async () => {
        try {
            setLoading(true);
            const res = await getUserOrProfile(userId);
            if (res.success) {
                setOfftaker(res.profile);
            }
        } catch (error) {
            console.error("Error loading offtaker profile:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#123524] justify-center items-center">
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    if (!offtaker) {
        return (
            <View className="flex-1 bg-[#123524] justify-center items-center p-6">
                <Text className="text-white text-lg text-center mb-4">Profile not found or unavailable.</Text>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    className="bg-white/10 px-8 py-3 rounded-full border border-white/20"
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const userDetails = offtaker.userId || {};
    const initials = (offtaker.companyName || userDetails.name || "U").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <View className="flex-1 bg-[#123524]">
            <StatusBar barStyle="light-content" />
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <View className="flex-row items-center px-4 py-3">
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
                    >
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold ml-4">Offtaker Profile</Text>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Hero Section */}
                    <View className="items-center py-8">
                        <View className="relative">
                            {offtaker.profilePhoto || userDetails.profileImage ? (
                                <Image 
                                    source={{ uri: offtaker.profilePhoto || userDetails.profileImage }} 
                                    className="w-28 h-28 rounded-3xl border-4 border-white/10" 
                                />
                            ) : (
                                <View className="w-28 h-28 rounded-3xl bg-emerald-700 items-center justify-center border-4 border-white/10">
                                    <Text className="text-white text-4xl font-bold">{initials}</Text>
                                </View>
                            )}
                            <View className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1.5 border-4 border-[#123524]">
                                <ShieldCheck size={16} color="#fff" />
                            </View>
                        </View>
                        
                        <Text className="text-white text-2xl font-bold mt-4">{offtaker.companyName || userDetails.name}</Text>
                        <View className="bg-emerald-400/20 px-3 py-1 rounded-full mt-2">
                            <Text className="text-emerald-400 font-bold text-xs uppercase tracking-widest">
                                {offtaker.businessType || 'Verified Buyer'}
                            </Text>
                        </View>
                    </View>

                    {/* Stats/Info Cards */}
                    <View className="bg-white rounded-t-[40px] flex-1 px-6 pt-8 pb-20">
                        <View className="flex-row justify-between mb-8">
                            <View className="items-center flex-1">
                                <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Rating</Text>
                                <View className="flex-row items-center">
                                    <Star size={16} color="#fbbf24" fill="#fbbf24" />
                                    <Text className="text-gray-900 font-bold text-lg ml-1">
                                        {offtaker.ratingAverage ? offtaker.ratingAverage.toFixed(1) : "4.8"}
                                    </Text>
                                </View>
                            </View>
                            <View className="w-[1px] h-10 bg-gray-100" />
                            <View className="items-center flex-1">
                                <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Experience</Text>
                                <Text className="text-gray-900 font-bold text-lg">
                                    {offtaker.yearsInBusiness || "5+"} Yrs
                                </Text>
                            </View>
                            <View className="w-[1px] h-10 bg-gray-100" />
                            <View className="items-center flex-1">
                                <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Status</Text>
                                <Text className="text-emerald-600 font-bold text-lg">Active</Text>
                            </View>
                        </View>

                        <Text className="text-gray-900 text-lg font-bold mb-4">About the Company</Text>
                        <Text className="text-gray-500 leading-6 mb-8">
                            {offtaker.description || `${offtaker.companyName || userDetails.name} is a leading agri-procurement firm specializing in bulk commodity trading and direct farmer sourcing across India.`}
                        </Text>

                        {/* Business Details */}
                        <Text className="text-gray-900 text-lg font-bold mb-4">Business Information</Text>
                        <View className="space-y-4">
                            <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-3">
                                <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center mr-4">
                                    <MapPin size={20} color="#059669" />
                                </View>
                                <View>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase">Location</Text>
                                    <Text className="text-gray-900 font-semibold">
                                        {offtaker.headquarters?.city ? `${offtaker.headquarters.city}, ${offtaker.headquarters.state}` : "Maharashtra, India"}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-3">
                                <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-4">
                                    <Phone size={20} color="#2563eb" />
                                </View>
                                <View>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase">Contact</Text>
                                    <Text className="text-gray-900 font-semibold">{offtaker.companyPhone || userDetails.phone || "+91 XXXXXXXXXX"}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-3">
                                <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-4">
                                    <Briefcase size={20} color="#7c3aed" />
                                </View>
                                <View>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase">Procurement Capacity</Text>
                                    <Text className="text-gray-900 font-semibold">
                                        {offtaker.procurementCapacity ? `${offtaker.procurementCapacity} ${offtaker.procurementUnit || 'Tons'}/month` : "100+ Tons Monthly"}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Text className="text-gray-900 text-lg font-bold mt-8 mb-4">Interested Crops</Text>
                        <View className="flex-row flex-wrap">
                            {(offtaker.preferredCrops || ['Wheat', 'Rice', 'Cotton', 'Soybean']).map((crop, index) => (
                                <View key={index} className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full mr-2 mb-2">
                                    <Text className="text-emerald-700 font-bold text-xs">{crop}</Text>
                                </View>
                            ))}
                        </View>
                        
                        <TouchableOpacity className="w-full bg-[#123524] py-4 rounded-2xl items-center justify-center mt-10 shadow-lg shadow-emerald-900/40">
                            <Text className="text-white font-bold text-lg">Send Business Proposal</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
