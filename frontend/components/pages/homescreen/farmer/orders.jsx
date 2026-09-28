import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../common/Header';
import { useTranslation } from 'react-i18next';

export default function OrdersScreen() {
    const { t } = useTranslation();
    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title={t('orders.title')} />
                <View className="flex-1 bg-[#f8fafc] justify-center items-center">
                    <Text className="text-2xl font-bold text-[#1e4a3b] mb-2">{t('orders.title')}</Text>
                    <Text className="text-gray-500">{t('orders.placeholder')}</Text>
                </View>
            </SafeAreaView>
        </View>
    );
}
