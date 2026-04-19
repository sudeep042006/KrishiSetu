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
import LinearGradient from 'react-native-linear-gradient';

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
            <StatusBar barStyle="dark-content" backgroundColor="#e0f2fe" />
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
                
                {/* Hero Section with Vibrant Green-Blue Gradient */}
                <View className="w-full pt-10 pb-[100px] px-6  relative overflow-hidden items-center">
                    <LinearGradient
                        colors={['#29ab49ff', '#0b7e28ff', '#23768aff', '#263a7bff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="absolute inset-0"
                    />

                    
                    {/* Decorative Background Elements */}
                    <View className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/10 rounded-full" />
                    <View className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
                    
                    {/* Logo Area */}
                    <View className="flex-row items-center mb-8 mt-2">
                        <Text className="text-3xl font-bold">🌾</Text>
                        <Text className="text-2xl font-black text-white ml-2 tracking-tight">KrishiSetu</Text>
                    </View>

                    <Animated.View style={animatedStyle} className="items-center z-10 w-full">
                        <Text className="text-[34px] font-extrabold text-white text-center leading-[42px] mb-4">
                            Empowering Farmers to Trade Smarter
                        </Text>
                        <Text className="text-[15px] text-white/80 text-center font-medium px-4 opacity-90 leading-6">
                            The professional bridge between local harvests and global procurement.
                        </Text>
                    </Animated.View>
                </View>

                {/* Main Content Actions */}
                <View className="flex-1 px-8 pt-8 pb-8 mt-[-60px] bg-white rounded-t-[40px] shadow-sm z-20">
                    <Animated.View style={animatedStyle} className="w-full">
                        <View className="items-center mb-10 w-[80%] self-center">
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate('Register')}
                                style={{ width: '100%' }}
                            >
                                <LinearGradient
                                    colors={['#10b981', '#1e4e8c']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ borderRadius: 30, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 5 }}
                                >
                                    <View className="flex-row items-center">
                                        <Text className="text-white font-black text-lg mr-2 uppercase tracking-widest">Get Started</Text>
                                        <Text className="text-white text-lg">→</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Feature Highlights */}
                        <View className="flex-row justify-between w-full">
                            <FeatureItem icon="📦" label="Post & Sell" />
                            <FeatureItem icon="💰" label="Best Prices" />
                            <FeatureItem icon="🔒" label="Secure" />
                        </View>
                    </Animated.View>


                    {/* Footer / Login Link */}
                    <View className="mt-auto items-center pt-10 pb-4">
                         <Text className="text-slate-400 text-[11px] mb-3 text-center uppercase tracking-wider font-semibold">
                            Trusted agriculture marketplace
                         </Text>
                         <View className="flex-row items-center">
                             <Text className="text-gray-500 font-medium">Already have an account? </Text>
                             <TouchableOpacity onPress={() => navigation.navigate('Login')} className="py-2">
                                 <Text className="text-[#155e75] font-bold text-base">Login</Text>
                             </TouchableOpacity>
                         </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const FeatureItem = ({ icon, label }) => (
    <View className="items-center w-[30%]">
        <View className="w-[56px] h-[56px] bg-slate-50 rounded-2xl items-center justify-center mb-3 border border-slate-100 shadow-sm">
            <Text className="text-2xl">{icon}</Text>
        </View>
        <Text className="text-slate-700 font-bold text-[10px] text-center uppercase tracking-tight">{label}</Text>
    </View>
);

