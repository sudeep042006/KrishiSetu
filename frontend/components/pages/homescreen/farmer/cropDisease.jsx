import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../common/Header';

export default function CropDiseaseScreen() {
    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Crop Disease" />
                <View className="flex-1 bg-[#f8fafc] justify-center items-center">
                    <Text className="text-2xl font-bold text-[#1e4a3b] mb-2">Crop Disease</Text>
                    <Text className="text-gray-500">This feather is coming soon............</Text>
                </View>
            </SafeAreaView>
        </View>
    );
}
