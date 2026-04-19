import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { authService } from '../service/api';

export default function RegisterScreen({ navigation }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        role: 'Farmer' // Default role
    });
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInput = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        let isValid = true;
        let newErrors = {};

        if (!formData.fullName.trim()) { newErrors.fullName = "Full name is required"; isValid = false; }
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "Valid email is required"; isValid = false; }
        if (!formData.mobile.trim() || formData.mobile.length < 10) { newErrors.mobile = "Valid mobile number is required"; isValid = false; }
        if (!formData.password) { newErrors.password = "Password is required"; isValid = false; }
        if (formData.password !== formData.confirmPassword) { newErrors.confirmPassword = "Passwords do not match"; isValid = false; }

        setErrors(newErrors);
        return isValid;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Drop confirmPassword before sending to API
            const { confirmPassword, ...dataToSubmit } = formData;
            
            await authService.registerUser(dataToSubmit);
            
            Alert.alert("Success", "Account created successfully!", [
                { text: "Log In", onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error) {
            Alert.alert("Registration Failed", error?.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#14243eff" />
            
            {/* Top Visual Area with Vibrant Green-Blue Gradient */}
            <View className="w-full pt-6 pb-24 px-6  relative overflow-hidden items-center z-0">
                <LinearGradient
                    colors={['#15d328ff', '#084a13ff', '#07224eff', '#228ce2ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute inset-0"
                />
                
                <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                
                <View className="flex-row items-center mb-6">
                    <Text className="text-2xl font-bold">🌾</Text>
                    <Text className="text-xl font-black text-white ml-2 tracking-tight">KrishiSetu</Text>
                </View>

                <Text className="text-[28px] font-extrabold text-white text-center mb-2">
                    Create an Account
                </Text>
                <Text className="text-[14px] text-white/70 text-center font-medium opacity-90">
                    Join the professional bridge for agricultural trade
                </Text>
            </View>

            {/* Form Area */}
            <ScrollView 
                className="flex-1 bg-white mt-[-60px] rounded-t-[40px] px-8 pt-8 z-10"
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                <View className="pb-10">
                    {/* Role Selector */}
                    <View className="mb-5">
                        <Text className="text-slate-400 text-[11px] font-black mb-3 ml-1 text-center uppercase tracking-widest">Select Your Role</Text>
                        <View className="flex-row justify-between">
                            <TouchableOpacity 
                                activeOpacity={0.8}
                                onPress={() => handleInput('role', 'Farmer')}
                                className={`flex-1 py-4 rounded-2xl items-center border mr-2 flex-row justify-center ${
                                    formData.role === 'Farmer' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'
                                }`}
                            >
                                <Text className="mr-2 text-lg">👨‍🌾</Text>
                                <Text className={`font-bold ${formData.role === 'Farmer' ? 'text-blue-600' : 'text-slate-400'}`}>
                                    Farmer
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                activeOpacity={0.8}
                                onPress={() => handleInput('role', 'Buyer')}
                                className={`flex-1 py-4 rounded-2xl items-center border ml-2 flex-row justify-center ${
                                    formData.role === 'Buyer' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'
                                }`}
                            >
                                <Text className="mr-2 text-lg">🤝</Text>
                                <Text className={`font-bold ${formData.role === 'Buyer' ? 'text-blue-600' : 'text-slate-400'}`}>
                                    Offtaker
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Inputs */}
                    <View className="mb-4">
                        <Text className="text-gray-600 text-xs font-semibold mb-1 ml-1 text-[#2b4c3b]">Full Name</Text>
                        <TextInput 
                            className={`w-full bg-[#f9fafb] border ${errors.fullName ? 'border-red-400' : 'border-gray-200'} rounded-2xl px-5 py-4 text-[#113123]`}
                            placeholder="John Doe"
                            placeholderTextColor="#9ca3af"
                            value={formData.fullName}
                            onChangeText={(t) => handleInput('fullName', t)}
                        />
                        {errors.fullName && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</Text>}
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-600 text-xs font-semibold mb-1 ml-1 text-[#2b4c3b]">Email Address</Text>
                        <TextInput 
                            className={`w-full bg-[#f9fafb] border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-2xl px-5 py-4 text-[#113123]`}
                            placeholder="user@example.com"
                            placeholderTextColor="#9ca3af"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.email}
                            onChangeText={(t) => handleInput('email', t)}
                        />
                        {errors.email && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email}</Text>}
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-600 text-xs font-semibold mb-1 ml-1 text-[#2b4c3b]">Mobile Number</Text>
                        <TextInput 
                            className={`w-full bg-[#f9fafb] border ${errors.mobile ? 'border-red-400' : 'border-gray-200'} rounded-2xl px-5 py-4 text-[#113123]`}
                            placeholder="+91 9876543210"
                            placeholderTextColor="#9ca3af"
                            keyboardType="phone-pad"
                            value={formData.mobile}
                            onChangeText={(t) => handleInput('mobile', t)}
                        />
                        {errors.mobile && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.mobile}</Text>}
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-600 text-xs font-semibold mb-1 ml-1 text-[#2b4c3b]">Password</Text>
                        <TextInput 
                            className={`w-full bg-[#f9fafb] border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-2xl px-5 py-4 text-[#113123]`}
                            placeholder="Create Password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={true}
                            value={formData.password}
                            onChangeText={(t) => handleInput('password', t)}
                        />
                        {errors.password && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>}
                    </View>

                    <View className="mb-8">
                        <Text className="text-gray-600 text-xs font-semibold mb-1 ml-1 text-[#2b4c3b]">Confirm Password</Text>
                        <TextInput 
                            className={`w-full bg-[#f9fafb] border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} rounded-2xl px-5 py-4 text-[#113123]`}
                            placeholder="Confirm Password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={true}
                            value={formData.confirmPassword}
                            onChangeText={(t) => handleInput('confirmPassword', t)}
                        />
                        {errors.confirmPassword && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</Text>}
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleRegister}
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        <LinearGradient
                            colors={['#10b981', '#1e4e8c']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ borderRadius: 24, paddingVertical: 18, alignItems: 'center', justifyCenter: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 4 }}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-black text-lg uppercase tracking-widest">Create Account</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-6 mb-8">
                        <Text className="text-slate-400 font-medium">Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="text-blue-600 font-bold">Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
