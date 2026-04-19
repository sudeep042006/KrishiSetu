import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

export default function Header({ title, showNotification = false, rightIcon = null }) {
    const navigation = useNavigation();

    return (
        <View className="flex-row items-center justify-between h-10 px-4 pt-12 pb-5 bg-[#020f04e9] rounded-b-3xl">
            <TouchableOpacity 
                className="mr-3 -mt-8"
                activeOpacity={0.7}
                onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            >
                <Menu color="#ffffffff" size={24} />
            </TouchableOpacity>

            <Text className="text-lg font-bold text-white tracking-wide -mt-8">{title}</Text>

            <View className="items-end min-w-[24px] -mt-8">
                {showNotification ? (
                    <TouchableOpacity activeOpacity={0.7} className="bg-white/10 p-2 rounded-full">
                        <Bell color="#ffffff" size={20} />
                    </TouchableOpacity>
                ) : rightIcon ? (
                    rightIcon
                ) : (
                    <View style={{ width: 24 }} />
                )}
            </View>
        </View>
    );
}
