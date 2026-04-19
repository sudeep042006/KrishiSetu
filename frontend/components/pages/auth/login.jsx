import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
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
            const response = await authService.loginUser(formData);
            console.log("Login Response FULL:", JSON.stringify(response, null, 2));

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
            <StatusBar barStyle="light-content" backgroundColor="#14243eff" />
            
            {/* Top Visual Area with Vibrant Green-Blue Gradient */}
            <View className="w-full pt-6 pb-24 px-6  relative overflow-hidden items-center z-0">
                <LinearGradient
                    colors={['#059669', '#10b981', '#3b82f6', '#1e4e8c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute inset-0"
                />
                
                <View className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
                <View className="absolute bottom-[-20px] -right-10 w-24 h-24 bg-white/10 rounded-full" />
                
                <View className="flex-row items-center mb-6">
                    <Text className="text-2xl font-bold">🌾</Text>
                    <Text className="text-xl font-black text-white ml-2 tracking-tight">KrishiSetu</Text>
                </View>

                <Text className="text-[28px] font-extrabold text-white text-center mb-2 mt-2">
                    Welcome Back!
                </Text>
                <Text className="text-[14px] text-white/70 text-center font-medium opacity-90">
                    The bridge to smarter agricultural trade
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
                        <Text className="text-slate-400 text-[11px] font-black mb-4 ml-1 text-center uppercase tracking-widest">Identify Yourself</Text>
                        <View className="flex-row justify-center space-x-4">
                            <TouchableOpacity 
                                activeOpacity={0.8}
                                onPress={() => handleInput('role', 'Farmer')}
                                className={`w-[45%] py-4 rounded-2xl items-center border flex-row justify-center ${
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
                                className={`w-[45%] py-4 rounded-2xl items-center border mx-2 flex-row justify-center ${
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
                            className={`w-full bg-slate-50 border ${errors.password ? 'border-red-400' : 'border-slate-100'} rounded-2xl px-5 py-[18px] text-slate-900 font-medium`}
                            placeholder="Password"
                            placeholderTextColor="#94a3b8"
                            secureTextEntry={true}
                            value={formData.password}
                            onChangeText={(t) => handleInput('password', t)}
                        />
                        {errors.password && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>}
                        
                        <TouchableOpacity className="mt-4 w-full items-end pr-2">
                            <Text className="text-blue-600 font-bold text-xs">Forgot password?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleLogin}
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        <LinearGradient
                            colors={['#10b981', '#1e4e8c']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ borderRadius: 24, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 4 }}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-black text-lg uppercase tracking-widest">Login to Portal</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-10 mb-8">
                        <Text className="text-slate-400 font-medium">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text className="text-blue-600 font-bold">Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
