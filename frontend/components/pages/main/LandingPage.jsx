import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    interpolate
} from 'react-native-reanimated';

export default function LandingPage({ navigation }) {
    // Animation Values
    const fadeAnim = useSharedValue(0);
    const slideAnim = useSharedValue(50);
    const scaleAnim = useSharedValue(0.9);

    useEffect(() => {
        // Trigger initial entry animations
        fadeAnim.value = withTiming(1, { duration: 1000 });
        slideAnim.value = withSpring(0, { damping: 12, stiffness: 90 });
        scaleAnim.value = withSpring(1, { damping: 10, stiffness: 80 });
    }, []);

    const animatedHeaderStyle = useAnimatedStyle(() => {
        return {
            opacity: fadeAnim.value,
            transform: [{ translateY: slideAnim.value }],
        };
    });

    const animatedGridStyle = useAnimatedStyle(() => {
        return {
            opacity: fadeAnim.value,
            transform: [
                { scale: scaleAnim.value },
                { translateY: withDelay(300, withSpring(0, { damping: 12 })) }
            ]
        };
    });

    return (
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header / Hero Section */}
            <Animated.View className="px-6 pt-20 pb-8 items-center" style={animatedHeaderStyle}>
                <View className="bg-teal-100 p-4 rounded-full mb-6">
                    {/* Placeholder for KrishiSetu Logo - A simple leaf/tractor icon representation */}
                    <Text className="text-4xl">🌱</Text>
                </View>

                <Text className="text-4xl font-extrabold text-gray-900 text-center tracking-tight mb-2">
                    Krishi<Text className="text-teal-600">Setu</Text>
                </Text>

                <Text className="text-lg text-gray-500 text-center font-medium px-4">
                    The Farmer's Bridge to better markets, resources, and community.
                </Text>
            </Animated.View>

            {/* Gamified Community Stats Grid */}
            <Animated.View className="px-6 mb-12" style={animatedGridStyle}>
                <Text className="text-xl font-bold text-gray-800 mb-4 px-2">Join Our Growing Network</Text>

                <View className="flex-row flex-wrap justify-between">
                    {/* Stat Card 1 */}
                    <View className="w-[48%] bg-green-50 rounded-2xl p-4 mb-4 border border-green-100 items-center justify-center shadow-sm">
                        <Text className="text-3xl mb-2">👨‍🌾</Text>
                        <Text className="text-2xl font-black text-green-700">10k+</Text>
                        <Text className="text-green-800 font-semibold text-xs text-center">Active Farmers</Text>
                    </View>

                    {/* Stat Card 2 */}
                    <View className="w-[48%] bg-amber-50 rounded-2xl p-4 mb-4 border border-amber-100 items-center justify-center shadow-sm">
                        <Text className="text-3xl mb-2">🌾</Text>
                        <Text className="text-2xl font-black text-amber-600">50K+</Text>
                        <Text className="text-amber-800 font-semibold text-xs text-center">Tons Traded</Text>
                    </View>

                    {/* Stat Card 3 */}
                    <View className="w-[48%] bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-100 items-center justify-center shadow-sm">
                        <Text className="text-3xl mb-2">🤝</Text>
                        <Text className="text-2xl font-black text-blue-600">500+</Text>
                        <Text className="text-blue-800 font-semibold text-xs text-center">Verified Buyers</Text>
                    </View>

                    {/* Stat Card 4 */}
                    <View className="w-[48%] bg-purple-50 rounded-2xl p-4 mb-4 border border-purple-100 items-center justify-center shadow-sm">
                        <Text className="text-3xl mb-2">📈</Text>
                        <Text className="text-2xl font-black text-purple-600">20%</Text>
                        <Text className="text-purple-800 font-semibold text-xs text-center">Avg. Profit Increase</Text>
                    </View>
                </View>
            </Animated.View>

            {/* Action Buttons Section */}
            <Animated.View className="px-6 w-full" style={animatedHeaderStyle}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    className="w-full bg-teal-600 rounded-xl py-4 items-center justify-center mb-4 shadow-lg shadow-teal-200 flex-row"
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text className="text-white font-bold text-lg mr-2">Get Started</Text>
                    <Text className="text-xl">🚀</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.6}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 items-center justify-center"
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text className="text-gray-700 font-bold text-lg">I already have an account</Text>
                </TouchableOpacity>
            </Animated.View>
        </ScrollView>
    );
}
