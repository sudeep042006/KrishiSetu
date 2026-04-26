import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../common/Header';

export default function OrdersScreen() {
    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Orders" />
                <View className="flex-1 bg-[#f8fafc] justify-center items-center">
                    <Text className="text-2xl font-bold text-[#1e4a3b] mb-2">Orders</Text>
                    <Text className="text-gray-500">This is a structured placeholder screen</Text>
                </View>
            </SafeAreaView>
        </View>
    );
}
