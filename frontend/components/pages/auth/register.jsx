import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
            <StatusBar barStyle="dark-content" backgroundColor="#eaf4ec" />
            
            {/* Top Visual Area similar to Landing Page */}
            <View className="bg-[#eaf4ec] w-full pt-6 pb-24 px-6 rounded-b-[60px] relative overflow-hidden items-center z-0">
                <View className="absolute -top-10 -right-10 w-40 h-40 bg-[#dcfce7] rounded-full opacity-50" />
                
                <View className="flex-row items-center mb-6">
                    <Text className="text-2xl">🌿</Text>
                    <Text className="text-xl font-black text-[#1e4a3b] ml-2 tracking-tight">KrishiSetu</Text>
                </View>

                <Text className="text-[28px] font-extrabold text-[#113123] text-center mb-2">
                    Create an Account
                </Text>
                <Text className="text-[14px] text-[#2c5b43] text-center font-medium opacity-90">
                    Register to start selling or buying easily
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
                        <Text className="text-[#346c53] text-[13px] font-bold mb-2 ml-1">I am a...</Text>
                        <View className="flex-row justify-between">
                            <TouchableOpacity 
                                activeOpacity={0.8}
                                onPress={() => handleInput('role', 'Farmer')}
                                className={`flex-1 py-3 rounded-2xl items-center border mr-2 flex-row justify-center ${
                                    formData.role === 'Farmer' ? 'bg-[#eef8f1] border-[#346c53]' : 'bg-white border-gray-200'
                                }`}
                            >
                                <Text className="mr-2">👨‍🌾</Text>
                                <Text className={`font-semibold ${formData.role === 'Farmer' ? 'text-[#346c53]' : 'text-gray-500'}`}>
                                    Farmer
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                activeOpacity={0.8}
                                onPress={() => handleInput('role', 'Buyer')}
                                className={`flex-1 py-3 rounded-2xl items-center border ml-2 flex-row justify-center ${
                                    formData.role === 'Buyer' ? 'bg-[#eef8f1] border-[#346c53]' : 'bg-white border-gray-200'
                                }`}
                            >
                                <Text className="mr-2">🤝</Text>
                                <Text className={`font-semibold ${formData.role === 'Buyer' ? 'text-[#346c53]' : 'text-gray-500'}`}>
                                    Buyer
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
                        className="w-full bg-[#346c53] rounded-[24px] py-[16px] items-center justify-center shadow-md shadow-[#346c53]/30"
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Register</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-6 mb-8">
                        <Text className="text-gray-500 font-medium">Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="text-[#346c53] font-bold">Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
