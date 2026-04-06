import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
    // In a real app, you would have a function to sign out and update the auth state

    return (
        <View className="flex-1 items-center justify-center bg-gray-900 px-6">
            <Text className="text-3xl font-bold text-teal-400 mb-8">Welcome to Home!</Text>

            <Text className="text-lg text-white mb-8 text-center">
                This is your main landing page. Only logged-in users can see this screen.
            </Text>

            <TouchableOpacity
                className="w-full bg-red-500 rounded-lg py-4 items-center mb-4"
                onPress={() => console.log('Sign Out logic here')}
            >
                <Text className="text-white font-bold text-lg">Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}
