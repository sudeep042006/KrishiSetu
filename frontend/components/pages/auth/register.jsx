import React from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

const registrationHandle = () => {
    console.log("Registration Handle");
}

export default function RegisterScreen({ navigation }) {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6 py-10">
                {/* Branding header */}
                <View className="items-center mb-8">
                    <View className="bg-teal-50 p-4 rounded-full mb-4 mt-8">
                        <Text className="text-4xl">👨‍🌾</Text>
                    </View>
                    <Text className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</Text>
                    <Text className="text-gray-500 font-medium text-center">Join the KrishiSetu community today</Text>
                </View>

                {/* Input Fields */}
                <View className="w-full mb-6">
                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Full Name</Text>
                    <TextInput
                        placeholder="Enter your full name"
                        placeholderTextColor="#9ca3af"
                        className="bg-gray-50 text-gray-900 rounded-xl px-4 py-4 mb-4 border border-gray-200 focus:border-teal-500"
                    />

                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Email Address</Text>
                    <TextInput
                        placeholder="Enter your email"
                        placeholderTextColor="#9ca3af"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="bg-gray-50 text-gray-900 rounded-xl px-4 py-4 mb-4 border border-gray-200 focus:border-teal-500"
                    />

                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Password</Text>
                    <TextInput
                        placeholder="Create a password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry
                        className="bg-gray-50 text-gray-900 rounded-xl px-4 py-4 mb-4 border border-gray-200 focus:border-teal-500"
                    />
                </View>

                {/* Register Button */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    className="w-full bg-teal-600 rounded-xl py-4 items-center mb-6 shadow-md shadow-teal-200"
                    onPress={registrationHandle}
                >
                    <Text className="text-white font-bold text-lg">Sign Up</Text>
                </TouchableOpacity>

                {/* Bottom Link */}
                <View className="flex-row justify-center mt-2 mb-8">
                    <Text className="text-gray-600 font-medium">Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text className="text-teal-600 font-bold">Login here</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
