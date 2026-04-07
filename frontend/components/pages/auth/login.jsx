import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../service/api';
import { AuthContext } from '../../../App';

export default function LoginScreen({ navigation }) {
    const [formData, setFormData] = useState({
        mobileOrEmail: '',
        password: '',
        role: 'Farmer' // Default role
    });
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Pull from context if available, otherwise fallback (for safety)
    const authContext = useContext(AuthContext);

    const handleInput = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        let isValid = true;
        let newErrors = {};

        if (!formData.mobileOrEmail.trim()) { newErrors.mobileOrEmail = "Mobile or email is required"; isValid = false; }
        if (!formData.password) { newErrors.password = "Password is required"; isValid = false; }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await authService.loginUser(formData);
            
            // On success, update global auth state
            if (authContext && authContext.login) {
                authContext.login(formData.role);
            } else {
                // Fallback direct navigation if Context is missing (failsafe)
                if (formData.role === 'Farmer') {
                    navigation.navigate('FarmerHome');
                } else {
                    navigation.navigate('OfftakerHome');
                }
            }
        } catch (error) {
            Alert.alert("Login Failed", error?.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#eaf4ec" />
            
            {/* Top Visual Area */}
            <View className="bg-[#eaf4ec] w-full pt-6 pb-24 px-6 rounded-b-[60px] relative overflow-hidden items-center z-0">
                <View className="absolute -top-10 -left-10 w-40 h-40 bg-[#dcfce7] rounded-full opacity-50" />
                <View className="absolute bottom-[-20px] -right-10 w-24 h-24 bg-[#bbf7d0] rounded-full opacity-60" />
                
                <View className="flex-row items-center mb-6">
                    <Text className="text-2xl">🌿</Text>
                    <Text className="text-xl font-black text-[#1e4a3b] ml-2 tracking-tight">KrishiSetu</Text>
                </View>

                <Text className="text-[28px] font-extrabold text-[#113123] text-center mb-2 mt-2">
                    Welcome Back!
                </Text>
                <Text className="text-[14px] text-[#2c5b43] text-center font-medium opacity-90">
                    Login to manage and sell your produce
                </Text>
            </View>

            {/* Form Area */}
            <ScrollView 
                className="flex-1 bg-white mt-[-60px] rounded-t-[40px] px-8 pt-10 z-10"
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <View className="pb-10">
                    {/* Role Selector */}
                    <View className="mb-6">
                        <Text className="text-[#346c53] text-[13px] font-bold mb-3 ml-1 text-center">Login As</Text>
                        <View className="flex-row justify-center space-x-4">
                            <TouchableOpacity 
                                activeOpacity={0.8}
                                onPress={() => handleInput('role', 'Farmer')}
                                className={`w-[45%] py-3 rounded-xl items-center border flex-row justify-center ${
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
                                className={`w-[45%] py-3 rounded-xl items-center border mx-2 flex-row justify-center ${
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
                    <View className="mb-4 mt-2">
                        <TextInput 
                            className={`w-full bg-[#f9fafb] border ${errors.mobileOrEmail ? 'border-red-400' : 'border-gray-200'} rounded-2xl px-5 py-[16px] text-[#113123]`}
                            placeholder="Mobile Number or Email"
                            placeholderTextColor="#9ca3af"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.mobileOrEmail}
                            onChangeText={(t) => handleInput('mobileOrEmail', t)}
                        />
                        {errors.mobileOrEmail && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.mobileOrEmail}</Text>}
                    </View>

                    <View className="mb-6">
                        <TextInput 
                            className={`w-full bg-[#f9fafb] border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-2xl px-5 py-[16px] text-[#113123]`}
                            placeholder="Password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={true}
                            value={formData.password}
                            onChangeText={(t) => handleInput('password', t)}
                        />
                        {errors.password && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>}
                        
                        <TouchableOpacity className="mt-3 w-full items-end pr-2">
                            <Text className="text-[#346c53] font-semibold text-xs">Forgot password?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        className="w-full bg-[#346c53] rounded-[24px] py-[16px] items-center justify-center shadow-md shadow-[#346c53]/30 mt-2"
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Login</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-10 mb-8">
                        <Text className="text-gray-500 font-medium">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text className="text-[#346c53] font-bold">Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
