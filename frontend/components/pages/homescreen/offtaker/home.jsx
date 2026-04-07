import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../../../App';

export default function OfftakerHome() {
    const authContext = useContext(AuthContext);

    return (
        <View className="flex-1 justify-center items-center bg-gray-50">
            <Text className="text-2xl font-bold mb-4 text-[#1e4a3b]">Buyer Dashboard</Text>
            <TouchableOpacity 
                className="bg-[#346c53] px-6 py-3 rounded-xl"
                onPress={() => authContext?.logout()}
            >
                <Text className="text-white font-bold">Logout</Text>
            </TouchableOpacity>
        </View>
    );
}
