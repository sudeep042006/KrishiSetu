import React, { useEffect, useState, useContext } from 'react';
import { 
    View, 
    Text, 
    ActivityIndicator, 
    Image, 
    ScrollView, 
    TouchableOpacity, 
    Dimensions, 
    Modal,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ChevronLeft, 
    Phone, 
    MapPin, 
    Sprout, 
    CheckCircle, 
    Layers, 
    Clock, 
    Star, 
    MessageSquare,
    Lock,
    ShieldCheck,
    TrendingUp,
    Zap
} from 'lucide-react-native';
import { getUserOrProfile, createOrGetChat } from '../../../../services/chatApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../../../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function FarmerProfileWindow({ navigation, route }) {
    const { userId } = route.params;
    const { isDarkMode } = useContext(ThemeContext);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [showSubModal, setShowSubModal] = useState(false);

    const heroBg = isDarkMode ? '#0a1628' : '#123524';
    const bodyBg = isDarkMode ? '#0d1117' : '#f8faf9';
    const cardBg = isDarkMode ? '#0f172a' : '#ffffff';
    const cardBorder = isDarkMode ? '#1e293b' : '#f1f5f9';
    const titleColor = isDarkMode ? '#e2e8f0' : '#111827';
    const subColor = isDarkMode ? '#475569' : '#6b7280';
    const labelColor = isDarkMode ? '#334155' : '#94a3b8';
    const pillBg = isDarkMode ? 'rgba(16,185,129,0.12)' : '#ecfdf5';
    const pillBorder = isDarkMode ? 'rgba(16,185,129,0.2)' : '#d1fae5';
    const pillText = isDarkMode ? '#10b981' : '#065f46';
    const bottomBarBg = isDarkMode ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.85)';
    const bottomBarBorder = isDarkMode ? '#1e293b' : '#f1f5f9';
    const chatBtnBg = isDarkMode ? '#1e293b' : '#f3f4f6';
    const chatBtnBorder = isDarkMode ? '#334155' : '#e5e7eb';
    const dealBtnBg = isDarkMode ? '#0f3460' : '#123524';

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

    const handleChat = async () => {
        try {
            const senderId = await AsyncStorage.getItem('userId');
            if (!senderId) return;

            const res = await createOrGetChat(senderId, userId);
            if (res.success) {
                navigation.navigate('MessageWindow', {
                    chatId: res.chat._id,
                    chatTitle: user.name,
                    otherUserId: userId
                });
            }
        } catch (error) {
            console.error("Chat Error:", error);
        }
    };

    const handleShowPhone = () => {
        if (isSubscribed) {
            // Already subscribed, just show phone logic would be here
        } else {
            setShowSubModal(true);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: heroBg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 16, fontWeight: '500' }}>Loading Professional Profile...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-[#123524] justify-center items-center px-6">
                <View className="bg-white/10 p-8 rounded-3xl items-center border border-white/10">
                    <Text className="text-white text-xl font-bold mb-2">Profile Not Available</Text>
                    <Text className="text-white/60 text-center mb-6">The profile you're looking for might have been moved or removed.</Text>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        className="px-8 py-3 bg-[#10b981] rounded-2xl"
                    >
                        <Text className="text-white font-bold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: bodyBg }}>
            <StatusBar barStyle="light-content" />
            
            {/* Header Overlay */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
                <SafeAreaView edges={['top']}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 }}>
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()} 
                            style={{ width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                        <View>
                            <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                <Star size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={{ height: 288, backgroundColor: heroBg, position: 'relative', overflow: 'hidden' }}>
                    <View style={{ position: 'absolute', top: -80, right: -80, width: 256, height: 256, borderRadius: 128, backgroundColor: 'rgba(16,185,129,0.15)' }} />
                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 128, backgroundColor: bodyBg, borderTopLeftRadius: 40, borderTopRightRadius: 40 }} />
                    
                    <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' }}>
                        <View className="relative shadow-2xl">
                            {profile?.profilePhoto ? (
                                <Image source={{ uri: profile.profilePhoto }} className="w-32 h-32 rounded-full border-4 border-white" />
                            ) : (
                                <View className="w-32 h-32 rounded-full bg-emerald-700 border-4 border-white justify-center items-center">
                                    <Text className="text-white text-4xl font-bold">{user.name?.charAt(0)}</Text>
                                </View>
                            )}
                            <View className="absolute bottom-1 right-1 bg-[#10b981] p-1.5 rounded-full border-2 border-white">
                                <CheckCircle size={18} color="#fff" />
                            </View>
                        </View>
                        
                        <View className="mt-3 items-center">
                            <Text className="text-2xl font-bold text-gray-900">{user.name}</Text>
                            <View className="flex-row items-center mt-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                <ShieldCheck size={14} color="#059669" />
                                <Text className="text-emerald-700 text-xs font-bold ml-1 uppercase tracking-wider">Trusted Partner</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Main Content */}
                <View className="px-5 pb-32">
                    {/* Quick Stats */}
                    <View className="flex-row justify-between bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6">
                        <View className="items-center flex-1 border-r border-gray-50">
                            <Layers size={22} color="#10b981" />
                            <Text className="text-gray-900 font-bold mt-1">{profile?.landArea || 'N/A'}</Text>
                            <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter">Land Area</Text>
                        </View>
                        <View className="items-center flex-1 border-r border-gray-50">
                            <Clock size={22} color="#f59e0b" />
                            <Text className="text-gray-900 font-bold mt-1">5+ Yrs</Text>
                            <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter">Experience</Text>
                        </View>
                        <View className="items-center flex-1">
                            <TrendingUp size={22} color="#3b82f6" />
                            <Text className="text-gray-900 font-bold mt-1">4.8</Text>
                            <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter">Rating</Text>
                        </View>
                    </View>

                    {/* About Section */}
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-gray-900 mb-3">Professional Summary</Text>
                        <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                            <Text className="text-gray-600 leading-6">
                                {user.name} is a high-volume producer specializing in sustainable agricultural practices. 
                                Committed to delivering premium quality harvest with full traceability and fair pricing.
                            </Text>
                        </View>
                    </View>

                    {/* Contact Card (Locked) */}
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-gray-900 mb-3">Direct Contact</Text>
                        <TouchableOpacity 
                            onPress={handleShowPhone}
                            activeOpacity={0.9}
                            className="bg-white rounded-3xl p-6 shadow-sm border-2 border-emerald-500/20 overflow-hidden relative"
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-x-4">
                                    <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center">
                                        <Phone size={22} color="#059669" />
                                    </View>
                                    <View>
                                        <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Mobile Number</Text>
                                        <Text className="text-gray-900 font-bold text-lg">
                                            {isSubscribed ? user.phone : '●●●●● ●●' + (user.phone?.slice(-3) || '●●●')}
                                        </Text>
                                    </View>
                                </View>
                                {!isSubscribed && (
                                    <View className="bg-[#123524] px-4 py-2 rounded-xl flex-row items-center gap-x-2">
                                        <Lock size={14} color="#fff" />
                                        <Text className="text-white font-bold text-xs">Unlock</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Farm Details */}
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-gray-900 mb-3">Farm Information</Text>
                        <View className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
                            <View className="flex-row items-center p-4 border-b border-gray-50">
                                <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-4">
                                    <MapPin size={20} color="#3b82f6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs font-bold uppercase mb-0.5">Primary Location</Text>
                                    <Text className="text-gray-900 font-medium leading-5">
                                        {profile?.village ? `${profile.village}, ${profile.district}, ${profile.state}` : user.address || 'Address not available'}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row items-center p-4">
                                <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center mr-4">
                                    <Sprout size={20} color="#059669" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs font-bold uppercase mb-0.5">Crop Portfolio</Text>
                                    <View className="flex-row flex-wrap mt-1 gap-1.5">
                                        {profile?.crops && profile.crops.length > 0 ? (
                                            profile.crops.map((crop, idx) => (
                                                <View key={idx} className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                                                    <Text className="text-emerald-700 text-[11px] font-bold">{crop}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text className="text-gray-500 italic text-sm">Diversified agricultural crops</Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: bottomBarBg, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40, flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: bottomBarBorder }}>
                <TouchableOpacity 
                    onPress={handleChat}
                    style={{ width: 56, height: 56, backgroundColor: chatBtnBg, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: chatBtnBorder }}
                >
                    <MessageSquare size={24} color={isDarkMode ? '#3b82f6' : '#123524'} />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={handleShowPhone}
                    style={{ flex: 1, height: 56, backgroundColor: dealBtnBg, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                    <Zap size={20} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>Initiate Deal</Text>
                </TouchableOpacity>
            </View>

            {/* Subscription Modal */}
            <Modal
                visible={showSubModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowSubModal(false)}
            >
                <TouchableOpacity 
                    className="flex-1 bg-black/60 justify-center items-center px-6"
                    activeOpacity={1}
                    onPress={() => setShowSubModal(false)}
                >
                    <TouchableOpacity 
                        activeOpacity={1}
                        className="bg-white w-full rounded-[40px] p-8 items-center"
                    >
                        <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6">
                            <Lock size={40} color="#059669" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">Premium Access Required</Text>
                        <Text className="text-gray-500 text-center leading-5 mb-8">
                            Subscribe to unlock direct contact details, historical yield data, and priority messaging with farmers.
                        </Text>
                        
                        <TouchableOpacity 
                            onPress={() => {
                                setShowSubModal(false);
                                setIsSubscribed(true); // Mocking subscription
                            }}
                            className="w-full bg-[#123524] py-4 rounded-2xl items-center shadow-lg"
                        >
                            <Text className="text-white font-bold text-lg">Get Premium Access</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => setShowSubModal(false)}
                            className="mt-4"
                        >
                            <Text className="text-gray-400 font-bold">Maybe Later</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

