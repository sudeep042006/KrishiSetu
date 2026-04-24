import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '../../../common/Header';
import { createOrGetChat } from '../../../../services/chatApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AvatarPlaceholder({ name = "Unknown", size = 100 }) {
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

const InfoCard = ({ icon, label, value }) => (
    <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row items-center">
        <View className="w-10 h-10 bg-green-50 rounded-full justify-center items-center mr-4">
            <Text className="text-lg">{icon}</Text>
        </View>
        <View className="flex-1">
            <Text className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</Text>
            <Text className="text-gray-900 font-semibold text-base mt-0.5">{value || 'Not provided'}</Text>
        </View>
    </View>
);

const Badge = ({ text, color = "blue" }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        green: "bg-green-50 text-green-700 border-green-100",
        purple: "bg-purple-50 text-purple-700 border-purple-100",
        amber: "bg-amber-50 text-amber-700 border-amber-100",
    };
    const style = colors[color] || colors.blue;
    return (
        <View className={`px-3 py-1 rounded-full border ${style.split(' ')[0]} ${style.split(' ')[2]} mr-2 mb-2`}>
            <Text className={`text-xs font-bold ${style.split(' ')[1]}`}>{text}</Text>
        </View>
    );
};

export default function OfftakerProfileWindowScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { offtaker } = route.params || {};
    const [loadingChat, setLoadingChat] = React.useState(false);

    if (!offtaker) {
        return (
            <View className="flex-1 bg-[#123524]">
                <SafeAreaView edges={['top']} className="flex-1">
                    <Header title="Buyer Profile" />
                    <View className="flex-1 bg-white justify-center items-center">
                        <Text className="text-gray-500">No profile data found</Text>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    const userDetails = offtaker.userId || {};

    const startChat = async () => {
        try {
            setLoadingChat(true);
            const currentUserId = await AsyncStorage.getItem('userId');
            if (!currentUserId || !userDetails._id) return;

            const res = await createOrGetChat(currentUserId, userDetails._id);
            
            if (res.success && res.chat) {
                navigation.navigate('MessageWindow', { 
                    chatId: res.chat._id, 
                    chatTitle: offtaker.companyName || userDetails.name, 
                    otherUserId: userDetails._id 
                });
            }
        } catch (error) {
            console.error("Error creating chat:", error);
        } finally {
            setLoadingChat(false);
        }
    };

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Buyer Details" />
                <ScrollView className="flex-1 bg-[#F8FAFC]" showsVerticalScrollIndicator={false}>
                    {/* Hero Section */}
                    <View className="bg-white pb-8 rounded-b-[40px] shadow-sm overflow-hidden">
                        <View className="h-32 bg-[#1B4332] w-full absolute top-0" />
                        <View className="items-center mt-12">
                            <View className="p-1 bg-white rounded-full shadow-lg">
                                {offtaker.profilePhoto || userDetails.profileImage ? (
                                    <Image 
                                        source={{ uri: offtaker.profilePhoto || userDetails.profileImage }} 
                                        className="w-32 h-32 rounded-full"
                                    />
                                ) : (
                                    <AvatarPlaceholder name={offtaker.companyName || userDetails.name} size={128} />
                                )}
                            </View>
                            
                            <Text className="text-2xl font-bold text-gray-900 mt-4 px-6 text-center">
                                {offtaker.companyName || userDetails.name}
                            </Text>
                            <Text className="text-green-700 font-semibold text-base mt-1">
                                {offtaker.businessType?.toUpperCase() || 'OFFTAKER'}
                            </Text>

                            <View className="flex-row mt-4 px-6">
                                <TouchableOpacity 
                                    onPress={startChat}
                                    disabled={loadingChat}
                                    className="bg-[#1B4332] flex-1 py-3.5 rounded-2xl flex-row items-center justify-center mr-3 shadow-md active:scale-95"
                                >
                                    {loadingChat ? (
                                        <ActivityIndicator size="small" color="#fff" className="mr-2" />
                                    ) : (
                                        <Text className="text-xl mr-2">💬</Text>
                                    )}
                                    <Text className="text-white font-bold text-base">Send Message</Text>
                                </TouchableOpacity>
                                
                                {offtaker.companyPhone && (
                                    <TouchableOpacity 
                                        onPress={() => Linking.openURL(`tel:${offtaker.companyPhone}`)}
                                        className="bg-green-50 px-5 py-3.5 rounded-2xl border border-green-100 shadow-sm active:scale-95"
                                    >
                                        <Text className="text-xl">📞</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Content Section */}
                    <View className="px-5 py-6">
                        {/* Summary Section */}
                        <View className="mb-8">
                            <Text className="text-gray-900 font-bold text-xl mb-4">About the Company</Text>
                            <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                <Text className="text-gray-600 leading-6 text-[15px]">
                                    {offtaker.companyDescription || `No description provided for ${offtaker.companyName || userDetails.name}.`}
                                </Text>
                                
                                {offtaker.website && (
                                    <TouchableOpacity 
                                        onPress={() => Linking.openURL(offtaker.website.startsWith('http') ? offtaker.website : `https://${offtaker.website}`)}
                                        className="mt-4 pt-4 border-t border-gray-50 flex-row items-center"
                                    >
                                        <Text className="text-blue-600 font-medium">Visit Website</Text>
                                        <Text className="ml-1 text-blue-600">↗</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Professional Badges */}
                        <View className="mb-8">
                            <Text className="text-gray-900 font-bold text-xl mb-4">Preferred Crops</Text>
                            <View className="flex-row flex-wrap">
                                {offtaker.preferredCrops && offtaker.preferredCrops.length > 0 ? (
                                    offtaker.preferredCrops.map((crop, idx) => (
                                        <Badge key={idx} text={crop} color="green" />
                                    ))
                                ) : (
                                    <Text className="text-gray-400 italic">No crops specified</Text>
                                )}
                            </View>
                        </View>

                        {/* Business Details */}
                        <View className="mb-6">
                            <Text className="text-gray-900 font-bold text-xl mb-4">Business Information</Text>
                            
                            <InfoCard 
                                icon="📦" 
                                label="Procurement Capacity" 
                                value={offtaker.procurementCapacity ? `${offtaker.procurementCapacity} ${offtaker.procurementUnit}/month` : null} 
                            />
                            
                            <InfoCard 
                                icon="🏢" 
                                label="Headquarters" 
                                value={offtaker.headquarters?.city ? `${offtaker.headquarters.city}, ${offtaker.headquarters.state}` : null} 
                            />

                            <InfoCard 
                                icon="📜" 
                                label="GST Number" 
                                value={offtaker.gstNumber} 
                            />

                            <InfoCard 
                                icon="🤝" 
                                label="Payment Terms" 
                                value={offtaker.paymentTermsPreference?.replace('_', ' ')} 
                            />

                            <InfoCard 
                                icon="🚛" 
                                label="Logistics Support" 
                                value={offtaker.logisticsSupportAvailable ? "Available" : "Not Available"} 
                            />
                        </View>

                        {/* Quality & Certs */}
                        {(offtaker.qualityStandards?.length > 0 || offtaker.certifications?.length > 0) && (
                            <View className="mb-8">
                                <Text className="text-gray-900 font-bold text-xl mb-4">Quality & Certifications</Text>
                                <View className="flex-row flex-wrap">
                                    {offtaker.qualityStandards?.map((std, idx) => (
                                        <Badge key={`std-${idx}`} text={std} color="amber" />
                                    ))}
                                    {offtaker.certifications?.map((cert, idx) => (
                                        <Badge key={`cert-${idx}`} text={cert} color="purple" />
                                    ))}
                                </View>
                            </View>
                        )}
                        
                        <View className="h-10" />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
