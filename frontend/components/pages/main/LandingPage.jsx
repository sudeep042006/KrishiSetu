import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingPage({ navigation }) {
    const fadeAnim = useSharedValue(0);
    const slideAnim = useSharedValue(30);

    useEffect(() => {
        fadeAnim.value = withTiming(1, { duration: 1000 });
        slideAnim.value = withSpring(0, { damping: 15, stiffness: 90 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: fadeAnim.value,
            transform: [{ translateY: slideAnim.value }],
        };
    });

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
                
                {/* Hero Section with Soft Green Aesthetic */}
                <View className="bg-[#eaf4ec] w-full pt-10 pb-[100px] px-6 rounded-b-[80px] relative overflow-hidden items-center">
                    {/* Decorative Background Elements */}
                    <View className="absolute top-0 w-full h-full bg-[#dcfce7] opacity-40 rounded-b-[80px]" />
                    <View className="absolute -bottom-10 -right-10 w-60 h-60 bg-[#bbf7d0] rounded-full opacity-30" />
                    <View className="absolute -top-10 -left-10 w-40 h-40 bg-[#bbf7d0] rounded-full opacity-20" />
                    
                    {/* Logo Area */}
                    <View className="flex-row items-center mb-8 mt-2">
                        <Text className="text-3xl">🌿</Text>
                        <Text className="text-2xl font-black text-[#1e4a3b] ml-2 tracking-tight">KrishiSetu</Text>
                    </View>

                    <Animated.View style={animatedStyle} className="items-center z-10 w-full">
                        <Text className="text-[34px] font-extrabold text-[#113123] text-center leading-[42px] mb-4">
                            Empowering Farmers to Trade Smarter
                        </Text>
                        <Text className="text-[15px] text-[#2c5b43] text-center font-medium px-4 opacity-90 leading-6">
                            Connect with trusted buyers, post and sell produce easily, and manage orders in one place.
                        </Text>
                    </Animated.View>
                </View>

                {/* Main Content Actions */}
                <View className="flex-1 px-8 pt-8 pb-8 mt-[-60px] bg-white rounded-t-[40px] shadow-sm z-20">
                    <Animated.View style={animatedStyle} className="w-full">
                        <View className="items-center mb-10 w-[70%] self-center">
                            <TouchableOpacity
                                activeOpacity={0.9}
                                className="w-full bg-[#346c53] rounded-[30px] py-[18px] items-center justify-center shadow-lg shadow-[#346c53]/40 flex-row"
                                onPress={() => navigation.navigate('Register')}
                            >
                                <Text className="text-white font-bold text-lg mr-2">Get Started</Text>
                                <Text className="text-white text-lg">→</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Feature Highlights */}
                        <View className="flex-row justify-between w-full">
                            <View className="items-center w-[30%]">
                                <View className="w-[52px] h-[52px] bg-[#eef8f1] rounded-2xl items-center justify-center mb-3 border border-[#d3ecd9]">
                                    <Text className="text-2xl">📦</Text>
                                </View>
                                <Text className="text-[#2b4c3b] font-bold text-[11px] text-center">Post & Sell Produce</Text>
                            </View>

                            <View className="items-center w-[30%]">
                                <View className="w-[52px] h-[52px] bg-[#eef8f1] rounded-2xl items-center justify-center mb-3 border border-[#d3ecd9]">
                                    <Text className="text-2xl">💰</Text>
                                </View>
                                <Text className="text-[#2b4c3b] font-bold text-[11px] text-center">Get Better Prices</Text>
                            </View>

                            <View className="items-center w-[30%]">
                                <View className="w-[52px] h-[52px] bg-[#eef8f1] rounded-2xl items-center justify-center mb-3 border border-[#d3ecd9]">
                                    <Text className="text-2xl">🔒</Text>
                                </View>
                                <Text className="text-[#2b4c3b] font-bold text-[11px] text-center">Secure Transactions</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Footer / Login Link */}
                    <View className="mt-auto items-center pt-10 pb-4">
                         <Text className="text-[#84a592] text-[11px] mb-3 text-center uppercase tracking-wider font-semibold">
                            Trusted agriculture marketplace
                         </Text>
                         <View className="flex-row items-center">
                             <Text className="text-gray-500 font-medium">Already have an account? </Text>
                             <TouchableOpacity onPress={() => navigation.navigate('Login')} className="py-2">
                                 <Text className="text-[#346c53] font-bold text-base">Login</Text>
                             </TouchableOpacity>
                         </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
