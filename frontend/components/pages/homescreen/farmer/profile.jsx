import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../common/Header';
import { AuthContext } from '../../../../../App';

export default function ProfileScreen() {
    const authContext = useContext(AuthContext);

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Profile" />
                <View className="flex-1 bg-[#f8fafc] justify-center items-center">
                    <Text className="text-2xl font-bold text-[#1e4a3b] mb-2">Profile</Text>
                    <Text className="text-gray-500 mb-8">This is a structured placeholder screen</Text>

                    <TouchableOpacity 
                        className="bg-[#1e4a3b] px-8 py-4 rounded-full min-w-[200px] items-center"
                        onPress={() => authContext?.logout()}
                    >
                        <Text className="text-white font-bold text-base">Logout</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
